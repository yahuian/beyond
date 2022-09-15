package db

import "time"

type Habit struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at" gorm:"index"`
	Name      string    `json:"name"`   // 名称
	Number    int       `json:"number"` // 数量
	Unit      string    `json:"unit"`   // 单位
}
