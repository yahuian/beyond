package config

import (
	"bytes"
	_ "embed"

	"github.com/spf13/viper"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/validatex"
)

//go:embed config.yaml
var sysConfig []byte

var Val struct {
	Server struct {
		Address string `mapstructure:"address" validate:"required"`
		Mode    string `mapstructure:"mode" validate:"oneof=debug release"`
		DB      string `mapstructure:"db" validate:"required"`
	} `mapstructure:"server" validate:"required"`
	Log struct {
		Filename string `mapstructure:"filename" validate:"required"`
		MaxSize  int    `mapstructure:"max_size" validate:"gt=0"`
		MaxAge   int    `mapstructure:"max_age" validate:"gt=0"`
	} `mapstructure:"log" validate:"required"`
	Setting struct {
		AutoOpenBrowser bool `mapstructure:"auto_open_browser"` // 启动项目时是否自动打开浏览器访问 http://${Val.Server.Address}
	} `mapstructure:"setting" validate:"required"`
}

func Init(name string) error {
	// 读取用户的配置
	user := viper.New()
	user.SetConfigFile(name)
	if err := user.ReadInConfig(); err != nil {
		return errorx.Wrap(err)
	}

	// 系统默认配置
	sys := viper.New()
	sys.SetConfigType("yaml")
	if err := sys.ReadConfig(bytes.NewReader(sysConfig)); err != nil {
		return errorx.Wrap(err)
	}

	// 合并配置
	res := viper.New()
	for _, key := range sys.AllKeys() {
		if v := user.Get(key); v != nil {
			res.Set(key, v)
		} else {
			res.Set(key, sys.Get(key))
		}
	}

	// 校验
	if err := res.Unmarshal(&Val); err != nil {
		return errorx.Wrap(err)
	}
	if err := validatex.Struct(&Val); err != nil {
		return errorx.Wrap(err)
	}

	// 写入最终配置文件
	res.SetConfigFile(name)
	if err := res.WriteConfig(); err != nil {
		return errorx.Wrap(err)
	}
	return nil
}
