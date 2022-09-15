package habit

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type updateParam struct {
	CreatedAt time.Time `json:"created_at" validate:"required"`
	createParam
}

// @Summary 更新打卡
// @Tags    习惯打卡
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.Habit}
// @Router  /habit [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	// 删除当天所有的打卡记录
	day := param.CreatedAt.Format("2006-01-02")
	if err := db.Delete[db.Habit]("DATE(created_at) = ?", day); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	// 创建新的打卡记录
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
