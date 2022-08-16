package db

import "time"

// bill 每日记账

// BillDetails 明细
type BillDetails struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:名称" json:"name"`
	Money     float64   `gorm:"comment:金额" json:"money"`
	Kind      string    `gorm:"comment:类型" json:"kind"` // income(收入) pay(支出)
	Type      string    `gorm:"comment:分类" json:"type,omitempty"`
	Ledger    string    `gorm:"comment:账本" json:"ledger,omitempty"`
	Note      string    `gorm:"comment:备注" json:"note,omitempty"`
	CreatedAt time.Time `gorm:"comment:创建时间" json:"created_at"`
}

// BillTemplate 模板
type BillTemplate struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:名称" json:"name"`
	Kind      string    `gorm:"comment:类型" json:"kind"` // type(分类) ledger(账本)
	Note      string    `gorm:"comment:备注" json:"note,omitempty"`
	Times     int       `gorm:"index,comment:使用次数" json:"times,omitempty"`
	CreatedAt time.Time `gorm:"comment:创建时间" json:"created_at"`
}
