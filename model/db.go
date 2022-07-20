package model

import (
	"reflect"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	client *gorm.DB

	schemas []any
)

func ConnectDB() error {
	// TODO replace logger with logx
	db, err := gorm.Open(sqlite.Open(config.Val.Server.DB), &gorm.Config{})
	if err != nil {
		return errorx.Wrap(err)
	}

	for _, v := range schemas {
		if err := db.AutoMigrate(v); err != nil {
			return errorx.WrapMsg(reflect.TypeOf(v).String(), err)
		}
	}

	client = db

	return nil
}
