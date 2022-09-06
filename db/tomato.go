package db

import "time"

type TomatoTask struct {
	ID          uint64    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // todo,doing,done
	CreatedAt   time.Time `json:"created_at" gorm:"index"`
	Predict     int       `json:"predict"` // 预估需要的番茄数
	Cost        int       `json:"cost"`    // 实际投入的番茄数
}
