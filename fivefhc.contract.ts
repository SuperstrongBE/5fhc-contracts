
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print, printui, Contract, check } from 'proton-tsc';
import { sendMintAsset, sendCreateTemplate, AtomicAttribute, Assets } from "proton-tsc/atomicassets"
import { AtomicValue } from 'proton-tsc/atomicassets/atomicdata';

import { ShareIndexKey, SplitSharePercentKey, MemoPositionalIndex, MintKey, LoyaltyHWMKey, CollectionName } from './fivefhc.constant';
import { Items } from './items.table';
import { Config } from './config.table';
import { AllowedMinter } from './minter.table';
import { sendTransferTokens } from 'proton-tsc/token';
import { Templates } from 'proton-tsc/atomicassets';


@contract
export class fivefhc extends Contract {

  private static FULL_PRICE: Asset = new Asset(10, new Symbol('XPR', 6));
  private static REDUCED_PRICE: Asset = new Asset(7, new Symbol('XPR', 6));
  private price: ExtendedAsset = new ExtendedAsset(fivefhc.FULL_PRICE, this.receiver);
  private itemTable: TableStore<Items> = Items.GetTable(this.receiver);
  private configTable: TableStore<Config> = Config.GetTable(this.receiver);
  private allowedMinterTable: TableStore<AllowedMinter> = AllowedMinter.GetTable(this.receiver);


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
    //Extract from memo eg:5FHCMINT_654654654201_7 by spliting on _ 
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

      const newAllowedMinter = new AllowedMinter(from, 1);
      this.allowedMinterTable.store(newAllowedMinter, this.receiver);

    } else {

      allowedMinter.allowedmint += 1;
      this.allowedMinterTable.update(allowedMinter, this.receiver);

    }



    print('\u001b[32m' + '>>>>>>> Config check after update' + '\u001b[0m')
    const updateHwm = this.configTable.lowerBound(Name.fromString(LoyaltyHWMKey).N);
    if (!updateHwm) return
    print('\u001b[32m' + `SplitHWM amount ${updateHwm.value}` + '\u001b[0m')
    const updateShare = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);
    if (!updateShare) return
    print('\u001b[32m' + `Total Shares ${updateShare.value}` + '\u001b[0m')
    print('\u001b[32m' + `Reward per share ${updateHwm.value / updateShare.value}` + '\u001b[0m')
    const minter = this.allowedMinterTable.lowerBound(from.N);
    if (!minter) return;
    print('\u001b[32m' + `Minter ${from.toString()} as ${minter.allowedmint} mint in reserve` + '\u001b[0m')
  }

  @action("createtempl")
  createTemplate (from: Name, collectionName: string, img: string, firstname: string, lastname: string, birthdate: string,url:string):void {

    const allowedMinter = this.allowedMinterTable.lowerBound(from.N);
    //TODO: Add check to reject the action
    if (!allowedMinter) return;
    if (allowedMinter.allowedmint == 0) return;

    const immutableData: AtomicAttribute[] = [
      new AtomicAttribute('name', AtomicValue.new<string>(`${firstname} ${lastname}`)),
      new AtomicAttribute('description', AtomicValue.new<string>(``)),
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

    const templateTable:TableStore<Templates> = Templates.getTable(Name.fromString('atomicassets'),Name.fromString(collectionName))
    const lastTemplate = templateTable.last();
    
    if (!lastTemplate)return;

    const mutableData: AtomicAttribute[] = [
      new AtomicAttribute('rlmultiplyer', AtomicValue.new<i32>(rlmultiplyer)),
    ];

    const immutable_data:AtomicAttribute[] = []

    
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

    print('reached the notify for fivefhc')
    const assetTable: TableStore<Assets> = Assets.getTable(Name.fromString('atomicassets'), newAssetOwner);
    assetTable.requireGet(assetId, 'No asset founds');
    const existingItem = this.itemTable.lowerBound(assetId);
    if (existingItem) {

      print("Error the item could not exist")

    } else {

      print("Create new item")
      if (!mutableData[0].value.get<i32>()) print("Missing required data in mutable")
      const rlMultiplier: u32 = mutableData[0].value.get<i32>();
      print(`RL multiplier: ${mutableData[0].value.get<i32>()}`)
      const newItem = new Items(
        assetId,
        newAssetOwner,
        newAssetOwner,
        rlMultiplier
      )
      this.itemTable.set(newItem, this.receiver);

      //######
      //Update split index
      const shareIndex = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);
      if (!shareIndex) return;
      shareIndex.value += (rlMultiplier as f32);
      this.configTable.update(shareIndex, this.receiver);

      const updateShare = this.configTable.lowerBound(Name.fromString(ShareIndexKey).N);
      if (!updateShare) return
      print('\u001b[32m' + `Total Shares ${updateShare.value}` + '\u001b[0m')


    }



  }



};