package plan

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Title          string `json:"title" validate:"required,max=100"`
	Description    string `json:"description" validate:"max=5000"`
	TomatoDuration int    `json:"tomato_duration" validate:"min=1,max=60"`
	Predict        int    `json:"predict" validate:"min=1"`
}

// @Summary 创建计划
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.TomatoPlan}
// @Router  /tomato/plan [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := &db.TomatoPlan{
		CreatedAt:      time.Now(),
		Title:          param.Title,
		Description:    param.Description,
		TomatoDuration: param.TomatoDuration,
		Predict:        param.Predict,
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
