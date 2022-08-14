package template

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type updateParam struct {
	ID uint64 `json:"id" validate:"required"`
	createParam
}

// @Summary 更新模板
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillTemplate}
// @Router  /bill/template [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := &db.BillTemplate{
		ID:        param.ID,
		Name:      param.Name,
		Kind:      param.Kind,
		Note:      param.Note,
		CreatedAt: param.CreatedAt,
	}

	count, err := db.Count[db.BillTemplate]("id = ?", data.ID)
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
