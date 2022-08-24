package db

import (
	"reflect"

	"github.com/glebarez/sqlite"
	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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
		BillType{},
		BillLedger{},
		Area{},
		Travel{},
	}
	for _, v := range schemas {
		if err := conn.AutoMigrate(v); err != nil {
			return errorx.WrapMsg(reflect.TypeOf(v).String(), err)
		}
	}

	if config.Val.Server.Mode == config.DebugMode {
		conn.Logger = logger.Default.LogMode(logger.Info)
	}

	client = conn

	if err := initData(); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}

func initData() error {
	inits := []func() error{
		billType,
		billLedger,
		initArea,
	}

	for _, f := range inits {
		if err := f(); err != nil {
			return errorx.Wrap(err)
		}
	}

	return nil
}

func billType() error {
	count, err := Count[BillType]("")
	if err != nil {
		return errorx.Wrap(err)
	}
	if count == 0 {
		data := []BillType{
			{Name: "👔服饰", Note: ""},
			{Name: "🍖餐饮", Note: ""},
			{Name: "🏡房租", Note: "房租、房贷、物业费等"},
			{Name: "🚍出行", Note: ""},
			{Name: "😷医疗", Note: ""},
			{Name: "😎娱乐", Note: ""},
		}
		if err := Client().Create(data).Error; err != nil {
			return errorx.WrapMsg("bill type", err)
		}
	}
	return nil
}

func billLedger() error {
	count, err := Count[BillLedger]("")
	if err != nil {
		return errorx.Wrap(err)
	}
	if count == 0 {
		data := []BillLedger{
			{Name: "📚默认", Note: "我的默认账本", IsDefault: true},
		}
		if err := Client().Create(data).Error; err != nil {
			return errorx.WrapMsg("bill ledger", err)
		}
	}
	return nil
}
