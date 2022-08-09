win="windows"
win64="amd64"
win32="386"

version="0.0.1"

release:
	swag fmt && swag init
	cd ui && yarn build

	# windows 64
	GOOS=${win} GOARCH=${win64} go build -o beyond.exe main.go
	zip -r beyond-${version}-${win}-${win64}.zip beyond.exe dist config/config.yaml

	# windows 32
	GOOS=${win} GOARCH=${win32} go build -o beyond.exe main.go
	zip -r beyond-${version}-${win}-${win32}.zip beyond.exe dist config/config.yaml

	# tidy
	rm beyond.exe
