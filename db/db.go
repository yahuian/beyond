package db

import (
	"reflect"

	"github.com/glebarez/sqlite"
	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"gorm.io/gorm"
)

var (
	client *gorm.DB
)

func Client() *gorm.DB {
	return client
}

func Connect() error {
	// TODO replace logger with logx
	conn, err := gorm.Open(sqlite.Open(config.Val.Server.DB), &gorm.Config{})
	if err != nil {
		return errorx.Wrap(err)
	}

	// auto migrate
	schemas := []any{
		BillDetails{},
		BillTemplate{},
	}
	for _, v := range schemas {
		if err := conn.AutoMigrate(v); err != nil {
			return errorx.WrapMsg(reflect.TypeOf(v).String(), err)
		}
	}

	client = conn

	// if err := initData(); err != nil {
	// 	return errorx.Wrap(err)
	// }

	return nil
}

// func initData() error {
// 	{
// 		t, _ := time.Parse("2006-01-02 15:04:05", "2017-03-02 15:04:05")
// 		data := []BillDetails{
// 			{Name: "西瓜", Money: 800.8, Kind: "pay", Type: "水果", Ledger: "", Note: "", CreatedAt: t},
// 		}
// 		if err := Client().Create(data).Error; err != nil {
// 			return errorx.Wrap(err)
// 		}
// 	}

// 	return nil
// }
