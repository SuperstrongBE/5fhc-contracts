
import { Asset, Contract, Name, requireAuth, Symbol, TableStore } from 'proton-tsc';
import { AllowContract } from 'proton-tsc/assembly/allow';
import { sendMintAsset } from 'proton-tsc/assembly/atomicassets';
import { AtomicAssets } from 'proton-tsc/assembly/contracts';
import { Items } from './items.table'

@contract
export class fivefhc extends AllowContract {

  private itemTable:TableStore<Items> = Items.GetTable(this.receiver);
  private static FULL_PRICE:Asset = new Asset(10,new Symbol('foobar',6))
  private static REUCED_PRICE:Asset = new Asset(6,new Symbol('foobar',6))

  @action("mintitem")
  mintitem(owner:Name, rl_multiplier:u32 ): void {
    
    this.checkContractIsNotPaused();
    requireAuth(this.receiver);
    const name:Name = new Name()
    const item:Items = new Items(name,978645123,owner,owner,rl_multiplier);
    sendMintAsset(this.receiver,this.receiver,Name.fromString('6546546'),Name.fromString('6546546'),654987654,owner,[],[],[])
    this.itemTable.set(item,this.receiver);
    

  }
}
