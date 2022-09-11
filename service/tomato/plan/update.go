package plan

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type updateParam struct {
	ID uint64 `json:"id" validate:"required"`
	createParam
}

// @Summary 更新计划
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.TomatoPlan}
// @Router  /tomato/plan [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := &db.TomatoPlan{
		ID:             param.ID,
		CreatedAt:      time.Now(),
		Title:          param.Title,
		Description:    param.Description,
		TomatoDuration: param.TomatoDuration,
		Predict:        param.Predict,
	}

	count, err := db.Count[db.TomatoPlan]("id = ?", data.ID)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if count == 0 {
		c.BadRequest(errorx.New("id not found"))
		return
	}

	if err := db.UpdateByID(data.ID, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
