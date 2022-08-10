export CGO_ENABLED="0"

assets=dist
config=config/config.yaml

version=0.0.1
flag=-trimpath -a -ldflags '-extldflags "-static"'

win=windows
winexe=beyond.exe
win64=amd64
win32=386
win64pkg=beyond-${version}-${win}-${win64}.zip
win32pkg=beyond-${version}-${win}-${win32}.zip

.PHONY: release tidy

release:
	swag fmt && swag init
	cd ui && yarn build

	# windows 64
	GOOS=${win} GOARCH=${win64} go build ${flag} -o ${winexe} .
	zip -r ${win64pkg} ${winexe} ${assets} ${config}

	# windows 32
	GOOS=${win} GOARCH=${win32} go build ${flag} -o ${winexe} .
	zip -r ${win32pkg} ${winexe} ${assets} ${config}

tidy:
	rm ${winexe} ${win64pkg} ${win32pkg}
