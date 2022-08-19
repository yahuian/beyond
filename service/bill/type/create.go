package Type

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Name string `json:"name" validate:"required,max=20"`
	Note string `json:"note" validate:"max=200"`
}

// @Summary 添加分类
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillType}
// @Router  /bill/type [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	if err := checkName(c, param.Name); err != nil {
		return
	}

	data := &db.BillType{
		Name: param.Name,
		Note: param.Note,
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}

func checkName(c *ctx.Context, name string) error {
	count, err := db.Count[db.BillType]("name = ?", name)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return err
	}

	if count != 0 {
		err := errorx.New("名称已存在，不可重复添加")
		c.BadRequest(err)
		return err
	}

	return nil
}
