package template

import (
	"errors"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
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

	old, err := db.GetOneByID[db.BillTemplate](param.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.BadRequest(err)
			return
		}
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if old.Name != param.Name {
		if err := checkName(c, param.Name); err != nil {
			return
		}
	}

	data := &db.BillTemplate{
		ID:        param.ID,
		Name:      param.Name,
		Kind:      param.Kind,
		Note:      param.Note,
		Times:     old.Times,
		CreatedAt: param.CreatedAt,
	}

	if err := db.UpdateAllByID(data.ID, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
