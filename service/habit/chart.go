package habit

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type base struct {
	Name string  `json:"name"`
	Sum  float64 `json:"sum"`
	Unit string  `json:"unit"`
	Date string  `json:"date"`
}

// @Summary 折线图
// @Tags    习惯打卡
// @Accept  json
// @Produce json
// @Param   year query    string true "year eg:2022"
// @Success 200  {object} ctx.Response{data=[]base}
// @Router  /habit/chart [get]
func Chart(c *ctx.Context) {
	year := c.DefaultQuery("year", time.Now().Format("2006"))

	var res []base
	err := db.Client().Model(db.Habit{}).
		Select("name, SUM(number) AS sum, unit, STRFTIME(\"%m\", created_at) AS date").
		Where("STRFTIME(\"%Y\", created_at) = ?", year).
		Group("name, STRFTIME(\"%m\", created_at)").
		Find(&res).Error
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: res,
	})
}
