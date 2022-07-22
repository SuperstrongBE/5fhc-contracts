import { Asset, Name, TableStore, print, Contract, check, ExtendedAsset, requireAuth, InlineAction, PermissionLevel, Symbol } from 'proton-tsc';
import { sendMintAsset, sendCreateTemplate, AtomicAttribute, Schemas, Templates, findIndexOfAttribute } from "proton-tsc/atomicassets"
import { AtomicValue } from 'proton-tsc/atomicassets/atomicdata';
import { sendTransferTokens } from 'proton-tsc/token';
import { ShareIndexKey, SplitSharePercentKey, MintKey, LoyaltyHWMKey, AvailableTemplateDataKey, PresaleKey, AvailablePresalesDataKey } from './fivefhc.constant';
import { Config, AllowedAccounts, Log, TemplatesData } from './tables';
import { Mint, ActWithdraw } from './inlines';
import { BuyPresale } from './inlines/buypresale.inline';

@contract
export class fivefhc extends Contract {

  private configTable: TableStore<Config> = new TableStore<Config>(this.receiver);
  private allowedMinterTable: TableStore<AllowedAccounts> = new TableStore<AllowedAccounts>(this.receiver);
  private templateDataTable: TableStore<TemplatesData> = new TableStore<TemplatesData>(this.receiver);
  private logsTable: TableStore<Log> = new TableStore<Log>(this.receiver);

  @action('updateconf')
  updateConfig(key: Name, value: i64): void {

    requireAuth(this.receiver);
    const config = new Config(
      key,
      value
    )
    this.configTable.update(config, this.receiver);

  }

  @action('addconf')
  addConfig(key: Name, value: i64): void {

    requireAuth(this.receiver);
    const config = new Config(
      key,
      value
    )
    this.configTable.store(config, this.receiver);

  }

  @action("remtempldata")
  remTemplateData(): void {

    requireAuth(this.receiver);
    const templateData = this.templateDataTable.first();
    check(!!templateData, "Template not found");
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

    requireAuth(this.receiver);
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

  @action('remallacc')
  remAllowedAcc(): void {

    requireAuth(this.receiver);
    const removableAcc = this.allowedMinterTable.last();
    check(!!removableAcc, 'Not account to remove');
    if (!removableAcc) return;
    this.allowedMinterTable.remove(removableAcc);

  }
  
  @action('upallmint')
  updateallacc(account:Name,allowedmint:u32): void {

    requireAuth(this.receiver);
    const updatableAcc = this.allowedMinterTable.get(account.N);
    check(!!updatableAcc, 'Not account to update');
    if (!updatableAcc) return;
    updatableAcc.allowedmint = allowedmint;
    this.allowedMinterTable.update(updatableAcc,this.receiver);

  }

  @action("transfer", notify)
  onTransfer(from: Name, to: Name, amount: Asset, memo: string): void {

    check(from.toString() != to.toString(), 'Cannot transfer to self');
    if (from.toString() == to.toString()) return;
    if (memo.indexOf(MintKey) == -1 && memo.indexOf(PresaleKey) == -1) { return };
    const targetContract = this.receiver;
    //Apply presale process anyway

    const buyPresaleAction = new InlineAction<BuyPresale>('buypresale');
    const buyPresaleAct = buyPresaleAction.act(targetContract, new PermissionLevel(this.receiver))
    const buyPresaleParams = new BuyPresale(from,amount);
    buyPresaleAct.send(buyPresaleParams);

    if (memo.indexOf(MintKey) >= 0) {

      const actWithdrawAction = new InlineAction<Mint>('mintnft');
      const actWithdrawAct = actWithdrawAction.act(targetContract, new PermissionLevel(this.receiver))
      const actWithdrawParams = new Mint(from);
      actWithdrawAct.send(actWithdrawParams);

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
    const logEnter = new Log(Name.fromU64(this.logsTable.availablePrimaryKey), 'Enter mintNFT');
    this.logsTable.store(logEnter, this.receiver)
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

    const logEnter = new Log(Name.fromU64(this.logsTable.availablePrimaryKey), `enter the logmint`);
    this.logsTable.store(logEnter, this.receiver)
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


    check(!!allowedMinter, `This fucking Owner ${ogOwner} is not an allowed minter in logmint`);
    check(!!allowedMinter, `OG Owner ${ogOwner} is not an allowed minter in logmint`);
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

    const logEnter = new Log(Name.fromU64(this.logsTable.availablePrimaryKey), `enter the lognewtempl`);
    this.logsTable.store(logEnter, this.receiver)
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
    check(!!allowedMinter, 'OG Owner ${ogOwner} is not an allowed minter in lognewtempl');
    
    if (!allowedMinter) return;
    sendMintAsset(this.receiver, this.receiver, collection, schema, templateId, Name.fromString(ogOwner), immutableData, templateData.mutableData, []);

    allowedMinter.allowedmint -= 1;
    this.allowedMinterTable.update(allowedMinter, this.receiver);

  }

  @action('withdraw')
  withdraw(actor: Name): void {

    
    const account = this.allowedMinterTable.get(actor.N);
    check(!!account, 'Unknow account');
    if (!account) return;

    const totalShares = this.configTable.get(Name.fromString(ShareIndexKey).N);
    check(!!totalShares, "Config not found: ShareIndexKey")
    if (!totalShares) return
    const loyaltyHWM = this.configTable.get(Name.fromString(LoyaltyHWMKey).N);
    check(!!loyaltyHWM, "Config not found: loyaltyHWM")
    if (!loyaltyHWM) return;

    const amntPerShare: i64 = loyaltyHWM.value / totalShares.value

    const widthdrawAmount: i64 = (amntPerShare * (account.totalrlm + account.allowedmint)) - account.claimedAmnt;
    check(widthdrawAmount > 0, 'Withdraw is 0')
    if (widthdrawAmount == 0) return;
    account.claimedAmnt += widthdrawAmount;


    const targetContract = Name.fromString('fivefhcbank');
    const actwithdraw = new InlineAction<ActWithdraw>('actwithdraw');
    const action = actwithdraw.act(targetContract, new PermissionLevel(this.receiver))
    const actionParams = new ActWithdraw(account.key, new Asset(widthdrawAmount, new Symbol('XPR', 4)), Name.fromString('eosio.token'));
    action.send(actionParams);

    const log = new Log(Name.fromU64(this.logsTable.availablePrimaryKey), `${account.key.toString()} will receive ${widthdrawAmount.toString()} from fivefhcshit`);
    this.logsTable.store(log, this.receiver)
    this.allowedMinterTable.update(account, this.receiver);

  }

  @action('buypresale')
  buypresale(from: Name, amount: Asset): void {

    const isEmptyTemplate = this.templateDataTable.isEmpty();
    //ok add a check for templates
    const availablePresale = this.configTable.get(Name.fromString(AvailablePresalesDataKey).N);
    check(!!availablePresale, 'Missing config AvailablePresalesKey')
    if (!availablePresale) return;
    check(availablePresale.value>0 || !isEmptyTemplate, 'No available presale for now...')

    const splitSharePercent = this.configTable.get(Name.fromString(SplitSharePercentKey).N);
    check(!!splitSharePercent, 'Missing config SplitSharePercentKey')
    if (!splitSharePercent) return
    const additionnalSplitShare = (amount.amount * splitSharePercent.value) / 100;

    const allowedMinter = this.allowedMinterTable.get(from.N)
    if (!allowedMinter) {

      const newAllowedMinter = new AllowedAccounts(from, 1, 0);
      newAllowedMinter.by_key = from.N;
      this.allowedMinterTable.store(newAllowedMinter, this.receiver);

    } else {

      allowedMinter.allowedmint += 1;
      this.allowedMinterTable.update(allowedMinter, this.receiver);

    }

    const LoyaltyHWM = this.configTable.get(Name.fromString(LoyaltyHWMKey).N);
    check(!!LoyaltyHWM, 'Missing config LoyaltyHWM')
    if (!LoyaltyHWM) return;
    LoyaltyHWM.value += additionnalSplitShare;
    this.configTable.update(LoyaltyHWM, this.receiver);

    availablePresale.value -=1;
    this.configTable.update(availablePresale,this.receiver);

    sendTransferTokens(this.receiver, Name.fromString('fivefhcbank'), [new ExtendedAsset(new Asset(additionnalSplitShare, amount.symbol), this.firstReceiver)], `Vaulted from ${from}`)

  }
};

