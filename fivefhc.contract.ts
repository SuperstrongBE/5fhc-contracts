
import { Asset, Name, requireAuth, Symbol, TableStore, ExtendedAsset, print, unpackActionData, printArray } from 'proton-tsc';
import { sendMintAsset,Templates,sendCreateTemplate, AtomicAttribute, MintAsset, AtomicValue, deserialize, Schemas } from "proton-tsc/atomicassets"
import { AllowContract } from "proton-tsc/allow";
import { Items } from './items.table';
import { SchemaName,CollectionName } from './fivefhc.constant';

@contract
export class fivefhc extends AllowContract {

  private static FULL_PRICE:      Asset = new Asset(10000000,new Symbol('FOOBAR',6));
  private static REDUCED_PRICE:   Asset = new Asset(7000000,new Symbol('FOOBAR',6));

  private itemTable:              TableStore<Items> = Items.getTable(this.receiver);
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
  ):void{
    if (!this.templateTable.isEmpty()){
      if (templateId){
        print(`has last template -> ${templateId.toString()}`);
        const schema = this.schemaTable.requireGet(schemaName.N,'No schema found');
        const templateData = this.templateTable.requireGet(templateId,`fuck there is no templates for template_id ${templateId}  `);
        const data = deserialize(templateData.immutable_serialized_data,schema.format);
        print(`immutable Length ${templateData.immutable_serialized_data.toString()}`)
        
        /*const og = data.map<boolean>((atomicVal)=>{
            
          if (atomicVal.key == "rl_multiplyer")print(`Atomic value key ${atomicVal.value.get<u32>().toString()}`);
          if (atomicVal.key == "og_owner")print(`Atomic value key ${atomicVal.value.get<string>().toString()}`);
          return atomicVal.key == "og_owner";

        })*/

        const item:Items = new Items(new Name(), templateId, newAssetOwner, newAssetOwner, 1);
        this.itemTable.set(item,this.receiver);
        print('end of inliineaction');
      } else {
        print('-> No last template')
      }
    } else {
      print(`-> templates table is Empty`);  
    }
  }
};
