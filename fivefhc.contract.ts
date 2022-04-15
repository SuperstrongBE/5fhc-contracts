
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print, unpackActionData } from 'proton-tsc';
import { sendMintAsset,Templates,sendCreateTemplate, AtomicAttribute, MintAsset, AtomicValue } from "proton-tsc/atomicassets"
import { AllowContract } from "proton-tsc/allow"
import { Items } from './items.table'

@contract
export class fivefhc extends AllowContract {

  private static FULL_PRICE:Asset = new Asset(10000000,new Symbol('FOOBAR',6))
  private static REDUCED_PRICE:Asset = new Asset(7000000,new Symbol('FOOBAR',6))
  private static collectionName:Name = Name.fromString('collection12');

  private itemTable:TableStore<Items> = Items.GetTable(this.receiver);
  private templateTable:TableStore<Templates> =  Templates.getTable(Name.fromString('atomicassets'),fivefhc.collectionName)
  
    

  @action("mintitem")
  mintitem(owner:Name, rl_multiplier:u32, collectionName:Name,schemaName:Name ): void {
    this.checkContractIsNotPaused();
    requireAuth(this.receiver); 
    
    const name:Name = new Name()
    const authorizedMinter = Name.fromString('fivefhc')
    const exAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
    
    print('-> Right before sendCreateTemplate');
    sendCreateTemplate(this.receiver,this.receiver,collectionName,schemaName,false,true,1,[]);
    sendMintAsset(this.contract,this.contract,collectionName,schemaName,1,owner,[
      new AtomicAttribute('rl_multiplyer',AtomicValue.new(7)),
      new AtomicAttribute('og_owner',AtomicValue.new(owner)),
    ],[],[]);
  }

  @action("logmint",notify)
  logmint():void{

    const inlineAction = unpackActionData<MintAsset>();
    
    if (!this.templateTable.isEmpty()){
      
      if (inlineAction.template_id){
        print(`has last template -> ${inlineAction.template_id.toString()}`)
        print(`was originaly minted by -> ${inlineAction.newasset_owner.toString()}`)
        print(`With RL multiplier -> ${inlineAction.immutable_data}`)
        const item:Items = new Items(new Name(),inlineAction.template_id,inlineAction.newasset_owner,inlineAction.newasset_owner,1);
        this.itemTable.set(item,this.receiver);
        
      }else {
        print('-> No last template')
      }
    }else {

      print(`-> templates table is Empty`);  
          

    }
    


  }

}
