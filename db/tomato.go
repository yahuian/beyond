package db

import (
	"time"

	"github.com/yahuian/gox/errorx"
)

type TomatoTask struct {
	ID          uint64    `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // todo,doing,done
	CreatedAt   time.Time `json:"created_at" gorm:"index"`
	Predict     int       `json:"predict"` // 预估需要的番茄数
	Cost        int       `json:"cost"`    // 实际投入的番茄数
	PlanID      uint64    `json:"plan_id" gorm:"index"`
}

type TomatoPlan struct {
	ID             uint64       `json:"id" gorm:"primaryKey"`
	Title          string       `json:"title"`
	Description    string       `json:"description"`
	TomatoDuration int          `json:"tomato_duration"` // 每个番茄的时长，单位为分钟
	CreatedAt      time.Time    `json:"created_at" gorm:"index"`
	Tasks          []TomatoTask `json:"tasks" gorm:"foreignKey:PlanID"`
	Predict        int          `json:"predict"`   // 预估可投入的番茄数
	Cost           int          `json:"cost"`      // 实际投入的番茄数
	CostTime       int          `json:"cost_time"` // 投入时间 = TomatoDuration * Cost
}

type TomatoPlanDao struct {
}

func NewTomatoPlanDao() *TomatoPlanDao {
	return &TomatoPlanDao{}
}

func (t *TomatoPlanDao) Delete(query any, args ...any) error {
	// 删除 plan
	var list []TomatoPlan
	err := Client().Where(query, args...).Preload("Tasks").
		Find(&list).Error
	if err != nil {
		return errorx.Wrap(err)
	}

	if err := Delete[TomatoPlan](query, args...); err != nil {
		return errorx.Wrap(err)
	}

	// 删除 task
	var ids []uint64
	for _, v := range list {
		for _, v := range v.Tasks {
			ids = append(ids, v.ID)
		}
	}

	if err := DeleteByID[TomatoTask](ids...); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
