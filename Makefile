prepare:
	echo $(date)
	npm run build
	rm -rf ./deploy && mkdir deploy
	cd ./deploy && mkdir fivefhc
	cd ./../../
	cd ./target && cp ./fivefhc.contract.wasm ./../deploy/fivefhc/fivefhc.contract.wasm && cp ./fivefhc.contract.abi ./../deploy/fivefhc/fivefhc.contract.abi
	
	cd ./deploy && mkdir fivefhcvault
	cd ./../../
	cd ./target && cp ./fivefhcvault.contract.wasm ./../deploy/fivefhcvault/fivefhcvault.contract.wasm && cp ./fivefhcvault.contract.abi ./../deploy/fivefhcvault/fivefhcvault.contract.abi
	
	cd ./deploy && mkdir fivefhcasset
	cd ./../../
	cd ./target && cp ./fivefhcasset.contract.wasm ./../deploy/fivefhcasset/fivefhcasset.contract.wasm && cp ./fivefhcasset.contract.abi ./../deploy/fivefhcasset/fivefhcasset.contract.abi

deploy-testnet:
	echo $(date)
	cd ./deploy/fivefhcasset && proton chain:set proton-test && proton contract:set fivefhcasset ./ 

deploy-mainet:

publish:
	make prepare
	make deploy-testnet