package db

import "time"

type TomatoTask struct {
	ID          uint64    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // todo,doing,done
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at" gorm:"index"`
}
