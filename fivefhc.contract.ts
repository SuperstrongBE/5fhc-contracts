import { Asset, Name, TableStore, print, Contract, check, ExtendedAsset, requireAuth } from 'proton-tsc';
import { sendMintAsset, sendCreateTemplate, AtomicAttribute, Schemas, Templates, findIndexOfAttribute } from "proton-tsc/atomicassets"
import { AtomicValue } from 'proton-tsc/atomicassets/atomicdata';
import { sendTransferTokens } from 'proton-tsc/token';
import { ShareIndexKey, SplitSharePercentKey, MintKey, LoyaltyHWMKey, AvailableTemplateDataKey } from './fivefhc.constant';
import { Config, AllowedAccounts, Log, TemplatesData } from './tables';

@contract
export class fivefhc extends Contract {

  private configTable: TableStore<Config> = new TableStore<Config>(this.receiver);
  private allowedMinterTable: TableStore<AllowedAccounts> = new TableStore<AllowedAccounts>(this.receiver);
  private templateDataTable: TableStore<TemplatesData> = new TableStore<TemplatesData>(this.receiver);

  @action('updateconf')
  updateConfig(key: Name, value: i64): void {

    const config = new Config(
      key,
      value
    )
    this.configTable.update(config, this.receiver);

  }

  @action('cool')
  cool():void {

    check(false,'This is fucking cool action');

  }

  @action('addconf')
  addConfig(key: Name, value: i64): void {

    const config = new Config(
      key,
      value
    )
    this.configTable.store(config, this.receiver);

  }


  @action("remtempldata")
  remTemplateData(): void {

    const templateData = this.templateDataTable.first();
    check(!!templateData, "Temmplte not found");
    if (!templateData) return;
    this.templateDataTable.remove(templateData);

  }

  @action("addtempldata")
  addTemplateData(
    key: Name,
    collectionName: Name,
    immutableData: AtomicAttribute[],
    mutableData: AtomicAttribute[]
  ): void {

    const dataKey = this.templateDataTable.availablePrimaryKey;
    const templateData = new TemplatesData();

    templateData.key.N = dataKey;
    templateData.collectionName = collectionName;
    templateData.immutableData = immutableData;
    templateData.immutableData.push(new AtomicAttribute('tdataid', AtomicValue.new<u64>(dataKey)))
    templateData.mutableData = mutableData;
    this.templateDataTable.store(templateData, this.receiver);
    const availableTemplateData = this.configTable.get(Name.fromString(AvailableTemplateDataKey).N);
    if (!availableTemplateData) {

      const configRow = new Config(Name.fromString(AvailableTemplateDataKey), 0);
      configRow.key = Name.fromString(AvailableTemplateDataKey);
      configRow.value += 1;
      this.configTable.store(configRow, this.receiver);

    } else {

      availableTemplateData.value += 1;
      this.configTable.update(availableTemplateData, this.receiver);

    }



  }

  @action("transfer", notify)
  onTransfer(from: Name, to: Name, amount: Asset, memo: string): void {

    check(from.toString() != to.toString(), 'Cannot transfer to self');
    if (from.toString() == to.toString()) return;

    if (memo.indexOf(MintKey) == -1) return;

    const splitSharePercent = this.configTable.get(Name.fromString(SplitSharePercentKey).N);
    if (!splitSharePercent) return
    const additionnalSplitShare = (amount.amount * splitSharePercent.value) / 100;
    //sendTransferTokens(this.receiver, Name.fromString('fivefhcvault'), [new ExtendedAsset(new Asset(additionnalSplitShare, amount.symbol), Name.fromString('xtokens'))], `Vaulted from ${from}`)

    const LoyaltyHWM = this.configTable.get(Name.fromString(LoyaltyHWMKey).N);
    if (!LoyaltyHWM) return;
    LoyaltyHWM.value += additionnalSplitShare;
    this.configTable.update(LoyaltyHWM, this.receiver);

    const allowedMinter = this.allowedMinterTable.get(from.N)

    if (!allowedMinter) {

      const newAllowedMinter = new AllowedAccounts(from, 1, 0);
      newAllowedMinter.by_key = from.N;
      this.allowedMinterTable.store(newAllowedMinter, this.receiver);

    } else {

      allowedMinter.allowedmint += 1;
      this.allowedMinterTable.update(allowedMinter, this.receiver);

    }

  }



  @action("createtempl")
  createTemplate(
    from: Name,
    collectionName: string,
    img: string,
    firstname: string,
    lastname: string,
    birthdate: string,
    url: string,
    description: string
  ): void {

    const allowedMinter = this.allowedMinterTable.get(from.N);

    check(!!allowedMinter, 'Not an allowed user')
    if (!allowedMinter) return;
    check(allowedMinter.allowedmint > 0, 'No mint slot')
    if (allowedMinter.allowedmint == 0) return;


    const log2 = new Log(new Name().N);
    log2.set_log(`Create new item ${firstname} ${lastname}`);

    const immutableData: AtomicAttribute[] = [
      new AtomicAttribute('name', AtomicValue.new<string>(`${firstname} ${lastname}`)),
      new AtomicAttribute('description', AtomicValue.new<string>(description)),
      new AtomicAttribute('img', AtomicValue.new<string>(img)),
      new AtomicAttribute('birthdate', AtomicValue.new<string>(birthdate)),
      new AtomicAttribute('url', AtomicValue.new<string>(url)),
      new AtomicAttribute('ogowner', AtomicValue.new<string>(from.toString())),

    ];

    sendCreateTemplate(
      this.receiver,
      this.receiver,
      Name.fromString(collectionName),
      Name.fromString(collectionName),
      false,
      true,
      1,
      immutableData
    );

  }

  @action("mintnft")
  mintnft(from: Name): void {

    const allowedMinter = this.allowedMinterTable.lowerBound(from.N);

    check(!!allowedMinter, 'No Allowed minter');
    if (!allowedMinter) return;
    check(allowedMinter.allowedmint > 0, 'Allowed mint reached');
    if (allowedMinter.allowedmint < 0) return;

    const pickedData = this.templateDataTable.last();
    check(pickedData != null, 'Can\'t select an item to mint');
    if (!pickedData) return;

    const schemaTable: TableStore<Schemas> = new TableStore<Schemas>(Name.fromString('atomicassets'), pickedData.collectionName)
    const schema = schemaTable.get(pickedData.collectionName.N);
    check(schema != null, 'schema didnt exists');
    if (!schema) return;
    const immutabes = pickedData.immutableData;
    immutabes.unshift(new AtomicAttribute('ogowner', AtomicValue.new<string>(from.toString())))


    sendCreateTemplate(
      this.receiver,
      this.receiver,
      pickedData.collectionName,
      pickedData.collectionName,
      true,
      true,
      1,
      immutabes
    );


  }

  @action("logmint", notify)
  logmint(
    assetId: u64,
    authorizedMinter: Name,
    collectionName: Name,
    schemaName: Name,
    templateId: i32,
    newAssetOwner: Name,
    immutableData: AtomicAttribute[],
    mutableData: AtomicAttribute[],
    backedTokens: Asset[],
    immutableTemplateData: AtomicAttribute[],
  ): void {

    const tdataidIndex = findIndexOfAttribute(immutableData, 'tdataid')
    check(tdataidIndex != -1, "Can't reach the tdataid")
    const templateDataKey = immutableData[tdataidIndex].value.get<u64>();

    const templateData = this.templateDataTable.lowerBound(templateDataKey)
    check(templateData != null, "Can't reach the temmplate data")
    if (!templateData) return;
    this.templateDataTable.remove(templateData)

    const ogOwnerIndex = findIndexOfAttribute(immutableData, 'ogowner')
    check(ogOwnerIndex != -1, "Can't find the ogowner")
    const ogOwner = immutableData[ogOwnerIndex].value.get<string>();

    const allowedMinter = this.allowedMinterTable.get(Name.fromString(ogOwner).N);
    //check(!!allowedMinter, `This fucking Owner ${ogOwner} is not an allowed minter in logmint`);
    //check(!!allowedMinter, `OG Owner ${ogOwner} is not an allowed minter in logmint`);
    if (!allowedMinter) return;
    allowedMinter.totalrlm += 1;
    this.allowedMinterTable.update(allowedMinter, this.receiver);

    const shareIndex = this.configTable.get(Name.fromString(ShareIndexKey).N);
    check(!!shareIndex, "Config not found");
    if (!shareIndex) return
    shareIndex.value += 1;
    this.configTable.update(shareIndex, this.receiver)

  }


  @action('lognewtempl', notify)
  logNewTempl(templateId: i32, creator: Name, collection: Name, schema: Name, transferable: boolean, burnable: boolean, maxSupply: u32, immutableData: AtomicAttribute[]): void {

    const ogOwnerIndex = findIndexOfAttribute(immutableData, 'ogowner')
    check(ogOwnerIndex != -1, "Can't find the ogowner")
    const ogOwner = immutableData[ogOwnerIndex].value.get<string>();
    const tdataidIndex = findIndexOfAttribute(immutableData, 'tdataid')
    check(tdataidIndex != -1, "Can't reach the tdataid")
    const templateDataKey = immutableData[tdataidIndex].value.get<u64>();

    const templateData = this.templateDataTable.get(templateDataKey)
    check(templateData != null, "Can't reach the temmplate data")
    if (!templateData) return;

    const allowedMinter = this.allowedMinterTable.get(Name.fromString(ogOwner).N);
    //check(!!allowedMinter, `This fucking Owner ${ogOwner} is not an allowed minter in lognewtemp`);
    //check(!!allowedMinter, 'OG Owner ${ogOwner} is not an allowed minter in lognewtempl');
    if (!allowedMinter) return;
    sendMintAsset(this.receiver, this.receiver, collection, schema, templateId, Name.fromString(ogOwner), immutableData, templateData.mutableData, []);

    allowedMinter.allowedmint -= 1;
    this.allowedMinterTable.update(allowedMinter, this.receiver);

  }

  @action('updateclaim')
  updateclaim(actor: Name, claimedAmnt: i64): void {

    requireAuth(Name.fromString('fivefhcvault'));
    const account = this.allowedMinterTable.get(actor.N);
    check(!!account, 'Unknow account');
    if (!account) return;
    account.claimedAmnt += claimedAmnt;
    this.allowedMinterTable.update(account, this.receiver);


  }

};

