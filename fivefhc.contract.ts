
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print, unpackActionData, printArray } from 'proton-tsc';
import { sendMintAsset,Templates,sendCreateTemplate, AtomicAttribute, MintAsset, AtomicValue, deserialize, Schemas } from "proton-tsc/atomicassets"
import { AllowContract } from "proton-tsc/allow";
import { Items } from './items.table';
import { SchemaName,CollectionName } from './fivefhc.constant';
import { Logmint } from './fivefhc.inline';

@contract
export class fivefhc extends AllowContract {

  private static FULL_PRICE:      Asset = new Asset(10000000,new Symbol('FOOBAR',6));
  private static REDUCED_PRICE:   Asset = new Asset(7000000,new Symbol('FOOBAR',6));

  private itemTable:              TableStore<Items> = Items.GetTable(this.receiver);
  private templateTable:          TableStore<Templates> =  Templates.getTable(Name.fromString('atomicassets'),Name.fromString(CollectionName))
  private schemaTable:            TableStore<Schemas> =  Schemas.getTable(Name.fromString('atomicassets'),Name.fromString(SchemaName))
  
    

  @action("mintitem")
  mintitem(owner:Name, rl_multiplier:u32, collectionName:Name,schemaName:Name ): void {
    this.checkContractIsNotPaused();
    requireAuth(this.receiver); 
    
    const name:Name = new Name()
    const authorizedMinter = Name.fromString('fivefhc');
    const exAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
    
    print('-> Right before sendCreateTemplate');
    sendCreateTemplate(this.receiver,this.receiver,collectionName,schemaName,false,true,1,[]);

    sendMintAsset(this.contract,this.contract,collectionName,schemaName,1,owner,[],[
      new AtomicAttribute('rl_multiplyer',AtomicValue.new<u32>(7)),
      new AtomicAttribute('og_owner',AtomicValue.new<string>(owner.toString())),
    ],[]);
  } 

  @action("logmint",notify)
  logmint():void{

    const inlineAction = unpackActionData<Logmint>();
    
    print("####### run mintasset on notify!")
    if (!this.templateTable.isEmpty()){
      
      print(`Asset id in inlineAction ${inlineAction.asset_id.toString()}`)
      
    }else {

      print(`-> templates table is Empty`);  
          

    }
    


  }

};
