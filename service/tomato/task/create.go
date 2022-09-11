package task

import (
	"errors"
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
)

type createParam struct {
	Title       string `json:"title" validate:"required,max=100"`
	Description string `json:"description" validate:"max=5000"`
	Status      string `json:"status" validate:"oneof=todo doing done"`
	Predict     int    `json:"predict" validate:"min=1"`
	PlanID      uint64 `json:"plan_id" validate:"required"`
}

// @Summary 添加任务
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.TomatoTask}
// @Router  /tomato/task [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	if err := updatePlan(c, param.PlanID, 0); err != nil {
		return
	}

	data := &db.TomatoTask{
		Title:       param.Title,
		Description: param.Description,
		Status:      param.Status,
		CreatedAt:   time.Now(),
		Predict:     param.Predict,
		PlanID:      param.PlanID,
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}

func updatePlan(c *ctx.Context, id uint64, cost int) error {
	old, err := db.GetOneByID[db.TomatoPlan](id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.BadRequest(err)
			return err
		}
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return err
	}

	count := cost + old.Cost

	data := &db.TomatoPlan{
		Cost:     count,
		CostTime: count * old.TomatoDuration,
	}
	if err := db.UpdateByID(id, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return err
	}

	return nil
}
