package db

import "time"

type Travel struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:名称" json:"name"`  // Area.Name
	Level     string    `gorm:"comment:级别" json:"level"` // Area.Level
	Note      string    `gorm:"comment:备注" json:"note"`
	CreatedAt time.Time `gorm:"index,comment:创建时间" json:"created_at"`
}
