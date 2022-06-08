
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print, printui, Contract } from 'proton-tsc';
import { sendMintAsset, sendCreateTemplate, AtomicAttribute, Assets, sendCreateSchema, AtomicFormat, sendTransferNfts } from "proton-tsc/atomicassets"
import { Items } from './items.table';

import { sendTransferTokens } from 'proton-tsc/token';

@contract
export class fivefhc extends Contract {

  private static FULL_PRICE: Asset = new Asset(10, new Symbol('XPR', 6));
  private static REDUCED_PRICE: Asset = new Asset(7, new Symbol('XPR', 6));
  private price: ExtendedAsset = new ExtendedAsset(fivefhc.FULL_PRICE, this.receiver);
  private itemTable: TableStore<Items> = Items.GetTable(this.receiver);


  @action("mintitem")
  mintitem(owner: Name, collectionName: Name, schemaName: Name, immutableData: AtomicAttribute[], mutableData: AtomicAttribute[]): void {

    requireAuth(owner);
    print(">>>> Mint the assset");
    
    

    sendTransferTokens(owner,Name.fromString('fivefhc'),[new ExtendedAsset(fivefhc.FULL_PRICE, Name.fromString("xtokens"))],"5FHC_MINT");
    /*sendCreateSchema(this.receiver, this.receiver, collectionName, schemaName, [
      new AtomicFormat("name","string" ),
      new AtomicFormat("img","string" ),
      new AtomicFormat("url","string" ),
      new AtomicFormat("description","string" ),
      new AtomicFormat("rl_multiplier","string" ),
      new AtomicFormat("og_owner","string" )
      
    ]);*/
    //sendCreateTemplate(this.receiver, this.receiver, collectionName, schemaName, false, true, 1, []);
    //sendMintAsset(this.receiver, this.receiver, collectionName, schemaName, 1, owner, immutableData, mutableData, []);
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
      if (!mutableData[0].value.get<u32>()) print("Missing required data in mutable")
      const rlMultipler: u32 = mutableData[0].value.get<u32>();
      printui(mutableData[0].value.get<u32>())
      const newItem = new Items(
        assetId,
        newAssetOwner,
        newAssetOwner,
        rlMultipler
      )
      this.itemTable.set(newItem, this.receiver);


    }

  }

  @action("transfer", notify)
  onTransfer(from:Name,to:Name,amount:Asset,memo:string): void {

    if(memo === "5FHC_MINT"){

      print('>>>> Transfer nofitifcation');
      print(memo);
      print(">>>> Mint the assset");
  

    }
    

  }






};

@packer
export class TokenTransfer extends ActionData {
    constructor (
        public from: Name = new Name(),
        public to: Name = new Name(),
        public quantity: Asset = new Asset(),
        public memo: string = "",
    ) {
        super();
    }
}
