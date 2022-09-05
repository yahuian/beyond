package task

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Title       string `json:"title" validate:"required,max=100"`
	Description string `json:"description" validate:"max=5000"`
	Status      string `json:"status" validate:"oneof=todo doing done"`
	Note        string `json:"note" validate:"max=5000"`
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

	data := &db.TomatoTask{
		Title:       param.Title,
		Description: param.Description,
		Status:      param.Status,
		CreatedAt:   time.Now(),
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
