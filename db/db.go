package db

import (
	"reflect"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	client *gorm.DB
)

func Connect() error {
	// TODO replace logger with logx
	conn, err := gorm.Open(sqlite.Open(config.Val.Server.DB), &gorm.Config{})
	if err != nil {
		return errorx.Wrap(err)
	}

	// auto migrate
	schemas := []any{
		BillDetails{},
	}
	for _, v := range schemas {
		if err := conn.AutoMigrate(v); err != nil {
			return errorx.WrapMsg(reflect.TypeOf(v).String(), err)
		}
	}

	client = conn

	return nil
}
