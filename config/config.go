package config

import (
	"github.com/spf13/viper"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/validatex"
)

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
}

func Init(name string) error {
	viper.SetConfigFile(name)

	if err := viper.ReadInConfig(); err != nil {
		return errorx.Wrap(err)
	}

	if err := viper.Unmarshal(&Val); err != nil {
		return errorx.Wrap(err)
	}

	if err := validatex.Struct(&Val); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
