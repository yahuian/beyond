package main

import (
	"flag"
	"fmt"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/beyond/model"

	"github.com/yahuian/gox/logx"
	"github.com/yahuian/gox/validatex"
)

func main() {
	// init validate
	if err := validatex.Init(validatex.WithGin()); err != nil {
		panic(err)
	}

	// init config
	var configFile string
	flag.StringVar(&configFile, "config", "config/config.yaml", "config file path")
	flag.Parse()
	if err := config.Init(configFile); err != nil {
		panic(fmt.Sprintf("%+v", err))
	}

	// init log
	file := &logx.FileOption{
		Filename: config.Val.Log.Filename,
		MaxSize:  config.Val.Log.MaxSize,
		MaxAge:   config.Val.Log.MaxAge,
	}
	logx.Init(file)
	defer logx.Sync()
	logx.SetLevel(logx.DebugLevel)

	// init db
	if err := model.ConnectDB(); err != nil {
		panic(fmt.Sprintf("%+v", err))
	}

	logx.Infof("listen on %s", config.Val.Server.Address)
}

// TODO dynamic logx,gin,gorm level(debug,release)
