package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/beyond/router"
	"github.com/zserge/lorca"

	"github.com/yahuian/gox/logx"
	"github.com/yahuian/gox/validatex"

	_ "github.com/yahuian/beyond/docs"
)

// @title    beyond api
// @BasePath /api
func main() {
	// init validate
	if err := validatex.Init(validatex.WithGin()); err != nil {
		panic(err)
	}

	// init config
	var configFile string
	flag.StringVar(&configFile, "config", "config.yaml", "config file path")
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
	defer logx.Sync() //nolint:errcheck
	logx.SetLevel(logx.DebugLevel)

	// init db
	if err := db.Connect(); err != nil {
		logx.Panicf("%+v", err)
	}

	// 不自动打开浏览器
	if !config.Val.Setting.AutoOpenBrowser {
		if err := router.Init(); err != nil {
			logx.Panicf("%+v", err)
		}
	}

	// 自动打开浏览器
	go func() {
		if err := router.Init(); err != nil {
			logx.Panicf("%+v", err)
		}
	}()

	ui, err := lorca.New("http://"+config.Val.Server.Address, "", 1224, 756)
	if err != nil {
		logx.Panic(err)
	}
	defer ui.Close()

	if err := ui.SetBounds(lorca.Bounds{WindowState: lorca.WindowStateMaximized}); err != nil {
		logx.Panic(err)
	}

	sign := make(chan os.Signal, 1)
	signal.Notify(sign, os.Interrupt)
	select {
	case <-sign:
	case <-ui.Done():
	}
}

// TODO dynamic logx,gin,gorm level(debug,release)

// TODO https://github.com/gin-gonic/gin#graceful-shutdown-or-restart
