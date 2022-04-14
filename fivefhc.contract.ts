
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print } from 'proton-tsc';
import { sendMintAsset,Templates,sendCreateTemplate } from "./node_modules/proton-tsc/assembly/atomicassets"
import { AllowContract } from "./node_modules/proton-tsc/assembly/allow"
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
    print(schemaName.toString());
    const name:Name = new Name()
    const authorizedMinter = Name.fromString('fivefhc')
    const exAsset = new ExtendedAsset(fivefhc.FULL_PRICE,this.receiver);
    const item:Items = new Items(name,978645123,owner,owner,rl_multiplier);
    this.itemTable.set(item,this.receiver);
    //Contracts.Token.sendTransferTokens(owner,this.receiver,[exAsset],'');
    sendCreateTemplate(this.contract,authorizedMinter,collectionName,schemaName,false,true,1,[])
    const lastTemplate:Templates | null = this.templateTable.last();
    if (lastTemplate)print(lastTemplate.schema_name.toString());
    //sendMintAsset(this.contract,authorizedMinter,collectionName,schemaName,98766,owner,[],[],[]);
  }

}
