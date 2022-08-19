package db

import "time"

// bill 每日记账

// BillDetails 明细
type BillDetails struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Money     float64   `gorm:"comment:金额" json:"money"`
	Kind      string    `gorm:"comment:类型" json:"kind"` // income(收入) pay(支出)
	Type      string    `gorm:"comment:分类" json:"type,omitempty"`
	Ledger    string    `gorm:"comment:账本" json:"ledger,omitempty"`
	Note      string    `gorm:"comment:备注" json:"note,omitempty"`
	CreatedAt time.Time `gorm:"index,comment:创建时间" json:"created_at"`
}

// BillType 分类管理
type BillType struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:名称" json:"name"`
	Note      string    `gorm:"comment:备注" json:"note,omitempty"`
	Times     int       `gorm:"index,comment:使用次数" json:"times,omitempty"`
	CreatedAt time.Time `gorm:"comment:创建时间" json:"created_at"`
}

// BillType 账本管理
type BillLedger struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:名称" json:"name"`
	Note      string    `gorm:"comment:备注" json:"note,omitempty"`
	Times     int       `gorm:"index,comment:使用次数" json:"times,omitempty"`
	CreatedAt time.Time `gorm:"comment:创建时间" json:"created_at"`
}
