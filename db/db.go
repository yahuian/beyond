package db

import (
	"reflect"
	"time"

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

	if err := initData(); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}

func initData() error {
	year := func(i int) time.Time {
		return time.Now().Add(time.Duration(i) * 365 * 24 * time.Hour)
	}
	month := func(i int) time.Time {
		return time.Now().Add(time.Duration(i) * 30 * 24 * time.Hour)
	}
	week := func(i int) time.Time {
		return time.Now().Add(time.Duration(i) * 7 * 24 * time.Hour)
	}

	// 每日记账-模板管理
	{
		count, err := Count[BillTemplate]("")
		if err != nil {
			return errorx.Wrap(err)
		}
		if count == 0 {
			data := []BillTemplate{
				{Name: "滑板", Kind: "ledger", Note: "记录滑板相关的开支"},
				{Name: "服饰", Kind: "type", Note: ""},
				{Name: "餐饮", Kind: "type", Note: ""},
				{Name: "房租", Kind: "type", Note: "房租、房贷、物业费等"},
				{Name: "出行", Kind: "type", Note: ""},
				{Name: "医疗", Kind: "type", Note: ""},
				{Name: "娱乐", Kind: "type", Note: ""},
			}
			if err := Client().Create(data).Error; err != nil {
				return errorx.Wrap(err)
			}
		}
	}

	// 每日记账-收支明细
	{
		count, err := Count[BillDetails]("")
		if err != nil {
			return errorx.Wrap(err)
		}
		if count == 0 {
			data := []BillDetails{
				{Money: 19.9, Kind: "pay", Type: "", Ledger: "", Note: "", CreatedAt: year(-1)},
				{Money: 35.9, Kind: "pay", Type: "", Ledger: "", Note: "", CreatedAt: month(-2)},
				{Money: 50, Kind: "pay", Type: "", Ledger: "", Note: "", CreatedAt: month(-1)},
				{Money: 19.9, Kind: "pay", Type: "", Ledger: "", Note: "", CreatedAt: week(-2)},
				{Money: 35, Kind: "pay", Type: "餐饮", Ledger: "", Note: "", CreatedAt: week(-1)},
				{Money: 22.5, Kind: "pay", Type: "餐饮", Ledger: "", Note: "夏天的命是西瓜给的！"},
				{Money: 25.8, Kind: "pay", Type: "餐饮", Ledger: "", Note: ""},
				{Money: 35, Kind: "pay", Type: "娱乐", Ledger: "", Note: ""},
				{Money: 260, Kind: "pay", Type: "", Ledger: "滑板", Note: ""},
				{Money: 200, Kind: "income", Type: "", Ledger: "", Note: "兼职骑手"},
			}
			if err := Client().Create(data).Error; err != nil {
				return errorx.Wrap(err)
			}
		}
	}

	return nil
}
