export CGO_ENABLED=0

win="windows"
win64="amd64"

version="dev"

# 本地打测试包
release_test:
	swag fmt && swag init
	cd ui && yarn build

	# windows 64
	GOOS=${win} GOARCH=${win64} go build -ldflags "-H=windowsgui" -o beyond.exe main.go
	cp config/config.yaml config.yaml
	zip -r beyond-${version}-${win}-${win64}.zip beyond.exe dist config.yaml
	rm config.yaml beyond.exe
