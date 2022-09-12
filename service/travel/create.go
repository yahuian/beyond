package travel

import (
	"errors"
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
)

type createParam struct {
	Name      string    `json:"name" validate:"required"`
	Note      string    `json:"note"`
	CreatedAt time.Time `json:"created_at"`
}

// @Summary 标记地点
// @Tags    旅行足迹
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.Travel}
// @Router  /travel [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	area, err := getArea(c, param.Name, "city")
	if err != nil {
		return
	}

	count, err := db.Count[db.Travel]("name IS ?", param.Name)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if count != 0 {
		c.BadRequest(errors.New("该城市已标记啦，不要重复点击了"))
		return
	}

	data := &db.Travel{
		Name:      param.Name,
		Level:     area.Level,
		Note:      param.Note,
		CreatedAt: param.CreatedAt,
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "标记成功，地图正在努力上色，请稍等~", Data: data})
}

func getArea(c *ctx.Context, name, level string) (db.Area, error) {
	area, err := db.GetOne[db.Area]("name = ? AND level = ?", name, level)
	if err == nil {
		return area, nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.BadRequest(err)
		return db.Area{}, err
	}

	logx.Errorf("%+v", err)
	c.InternalErr(err)
	return db.Area{}, err
}
