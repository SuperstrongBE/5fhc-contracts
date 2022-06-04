
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print} from 'proton-tsc';
import { sendMintAsset,sendCreateTemplate, AtomicAttribute, Assets } from "proton-tsc/atomicassets"
import { AllowContract } from "proton-tsc/allow";
import { Items } from './items.table';

import { sendTransferTokens } from 'proton-tsc/token';

@contract
export class fivefhc extends AllowContract {

  private static FULL_PRICE       :Asset = new Asset(10000000,new Symbol('FOOBAR',6));
  private static REDUCED_PRICE    :Asset = new Asset(7000000,new Symbol('FOOBAR',6));
  private price                   :ExtendedAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
  private itemTable               :TableStore<Items> = Items.GetTable(this.receiver);
    

  @action("mintitem")
  mintitem(owner:Name, collectionName:Name,schemaName:Name,immutableData:AtomicAttribute[], mutableData:AtomicAttribute[] ): void {
    this.checkContractIsNotPaused();
    requireAuth(this.receiver); 
    
    const name:Name = new Name()
    const authorizedMinter = Name.fromString('fivefhc');
    const exAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
    
    print('-> Right before sendCreateTemplate');
    sendTransferTokens(owner,Name.fromString('fivefhc'),[this.price],'')
    sendCreateTemplate(this.receiver,this.receiver,collectionName,schemaName,false,true,1,[]);
    //sendMintAsset(this.contract,this.contract,collectionName,schemaName,1,owner,immutableData,mutableData,[]);
  } 

  @action("logmint",notify)
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
  ):void {

    print('reached the notify for fivefhc')
    const assetTable: TableStore<Assets> =  Assets.getTable(Name.fromString('atomicassets'),newAssetOwner);
    assetTable.requireGet(assetId,'No asset founds');
    const existingItem = this.itemTable.lowerBound(assetId);
    if (existingItem) {

      print("Error the item could not exist")

    }/*else {

      print("Create new item")
      const rlMultipler:u32 = mutableData[0].value.get<u32>();
      const newItem = new Items(
        assetId,
        newAssetOwner,
        newAssetOwner,
        3
      )
      this.itemTable.set(newItem,this.receiver);
      
        
    }*/

      


  }
/*
  @action("transfer", notify)
  onTransfer(): void {

    print('Cool transfer');


  }

*/




};
