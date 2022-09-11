package task

import (
	"errors"
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
)

type updateParam struct {
	ID   uint64 `json:"id" validate:"required"`
	Cost int    `json:"cost"`
	createParam
}

// @Summary 更新任务
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.TomatoTask}
// @Router  /tomato/task [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	old, err := db.GetOneByID[db.TomatoTask](param.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.BadRequest(err)
			return
		}
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if err := updatePlan(c, param.PlanID, param.Cost-old.Cost); err != nil {
		return
	}

	data := &db.TomatoTask{
		ID:          param.ID,
		Title:       param.Title,
		Description: param.Description,
		Status:      param.Status,
		CreatedAt:   time.Now(),
		Predict:     param.Predict,
		Cost:        param.Cost,
		PlanID:      param.PlanID,
	}

	if err := db.UpdateAllByID(data.ID, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
