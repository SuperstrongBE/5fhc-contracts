
import { Asset, Name, TableStore, print, Contract } from 'proton-tsc';
import { sendMintAsset, sendCreateTemplate, AtomicAttribute, deserialize, Schemas } from "proton-tsc/atomicassets"
import { AtomicValue } from 'proton-tsc/atomicassets/atomicdata';

import { ShareIndexKey, SplitSharePercentKey, MintKey, LoyaltyHWMKey } from './fivefhc.constant';
import { Config } from './config.table';
import { AllowedAccounts } from './allowedaccounts.table';
import { Templates } from 'proton-tsc/atomicassets';
import { Log } from './logs.table';


@contract
export class fivefhc extends Contract {
  
  private configTable: TableStore<Config> = Config.GetTable(this.receiver);
  private allowedMinterTable: TableStore<AllowedAccounts> = AllowedAccounts.GetTable(this.receiver);

  @action('updateconf')
  updateConfig(key: Name, value: f32): void {

    // TODO: Check if fivefhc is the caller
    const config = new Config(
      key,
      value
    )
    this.configTable.store(config, this.receiver);

    const stored = this.configTable.lowerBound(key.N);
    if (stored) {
      print(`${stored.key}`);
      print(`${stored.value}`);

    }

  }

  @action("transfer", notify)
  onTransfer(from: Name, to: Name, amount: Asset, memo: string): void { 

    // TODO: Add conditionnal check for from account to filter unwanted account

    //######
    //Extract from memo eg:5FHCMINT
    if (memo.indexOf(MintKey) == -1) return;

    //######
    //Split share for this transfer
    const splitSharePercent = this.configTable.lowerBound(Name.fromString(SplitSharePercentKey).N);
    if (!splitSharePercent) return
    const additionnalSplitShare = amount.amount as f32 * splitSharePercent.value;

    //Update loyalty amount by high water mark
    const LoyaltyHWM = this.configTable.lowerBound(Name.fromString(LoyaltyHWMKey).N);
    if (!LoyaltyHWM) return;
    LoyaltyHWM.value += additionnalSplitShare;
    this.configTable.update(LoyaltyHWM, this.receiver);

    //######
    //Allow future mint
    const allowedMinter = this.allowedMinterTable.lowerBound(from.N);
    if (!allowedMinter) {

      const newAllowedMinter = new AllowedAccounts(from, 1, 0);
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

    const allowedMinter = this.allowedMinterTable.lowerBound(from.N);
    //TODO: Add check to reject the action
    if (!allowedMinter) return;
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

  @action("mintasset")
  mintAsset(from: Name, collectionName: string, rlmultiplyer: i32): void {

    const allowedMinter = this.allowedMinterTable.lowerBound(from.N);

    //TODO: Add check to reject the action
    if (!allowedMinter) return;
    if (allowedMinter.allowedmint == 0) return;

    const templateTable: TableStore<Templates> = Templates.getTable(Name.fromString('atomicassets'), Name.fromString(collectionName))
    const lastTemplate = templateTable.last();

    const log = new Log(new Name().N);

    if (!lastTemplate) return;

    const schemaTable: TableStore<Schemas> = Schemas.getTable(Name.fromString('atomicassets'), Name.fromString(collectionName))
    const schema = schemaTable.lowerBound(lastTemplate.schema_name.N);

    //this.logTable.store(log,this.receiver);

    const mutableData: AtomicAttribute[] = [
      new AtomicAttribute('rlmultiplyer', AtomicValue.new<i32>(rlmultiplyer)),
    ];

    if (!schema) return;
    const immutable_data: AtomicAttribute[] = deserialize(lastTemplate.immutable_serialized_data, schema.format)

    sendMintAsset(this.receiver, this.receiver, Name.fromString(collectionName), Name.fromString(collectionName), lastTemplate.template_id, from, immutable_data, mutableData, []);
    allowedMinter.allowedmint -= 1;
    this.allowedMinterTable.update(allowedMinter, this.receiver);

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




    if (!mutableData[0].value.get<i32>()) print("Missing required data in mutable")
    const rlmultiplier: u32 = mutableData[0].value.get<i32>();

    const existingMinter = this.allowedMinterTable.lowerBound(newAssetOwner.N)
    if (!existingMinter) return;
    existingMinter.totalrlm += rlmultiplier;
    this.allowedMinterTable.update(existingMinter, this.receiver)


    //######
    //Update split index
    const shareIndex = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);
    if (!shareIndex) return;
    shareIndex.value += (rlmultiplier as f32);
    this.configTable.update(shareIndex, this.receiver);

    const updateShare = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);
    if (!updateShare) return;

  }


  @action('lognewtempl', notify)
  logNewTempl(): void {

    print('Ok code happens');
    const updateShare = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);

  }

};

//ok