prepare:
	echo $(date)
	npm run build
	rm -rf ./deploy && mkdir deploy
	cd ./deploy && mkdir fivefhcmint
	cd ./../../
	cd ./target && cp ./fivefhcmint.contract.wasm ./../deploy/fivefhcmint/fivefhcmint.contract.wasm && cp ./fivefhcmint.contract.abi ./../deploy/fivefhcmint/fivefhcmint.contract.abi
	
	cd ./deploy && mkdir fivefhcvault
	cd ./../../
	cd ./target && cp ./fivefhcvault.contract.wasm ./../deploy/fivefhcvault/fivefhc.contract.wasm && cp ./fivefhcvault.contract.abi ./../deploy/fivefhcvault/fivefhcvault.contract.abi

deploy-testnet:
	echo $(date)
	cd ./deploy/fivefhcmint && proton chain:set proton-test && proton contract:set fivefhcmint ./ &&  cd ./deploy/fivefhcvault && proton chain:set proton-test && proton contract:set fivefhcvault ./

deploy-mainet:

publish:
	make prepare
	make deploy-testnet