package habit

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type Base struct {
	Name      string    `json:"name" validate:"required,max=10"`
	Number    float64   `json:"number" validate:"required"`
	Unit      string    `json:"unit" validate:"required,max=10"`
	CreatedAt time.Time `json:"created_at" validate:"required"`
}

type createParam struct {
	Habit []Base `json:"habit" validate:"required"`
}

// @Summary 添加打卡
// @Tags    习惯打卡
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.Habit}
// @Router  /habit [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := make([]db.Habit, 0, len(param.Habit))
	for _, v := range param.Habit {
		data = append(data, db.Habit{
			CreatedAt: v.CreatedAt,
			Name:      v.Name,
			Number:    v.Number,
			Unit:      v.Unit,
		})
	}

	if err := db.Client().Create(data).Error; err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
