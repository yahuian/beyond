package details

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

// @Summary 更新明细
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillDetails}
// @Router  /bill/details [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	if err := checkTpl(c, param.Type, param.Ledger); err != nil {
		return
	}

	count, err := db.Count[db.BillDetails]("id = ?", param.ID)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if count == 0 {
		c.BadRequest(errorx.New("id not found"))
		return
	}

	data := &db.BillDetails{
		ID:        param.ID,
		Name:      param.Name,
		Money:     param.Money,
		Kind:      param.Kind,
		Type:      param.Type,
		Ledger:    param.Ledger,
		Note:      param.Note,
		CreatedAt: param.CreatedAt,
	}

	if err := db.UpdateByID(data.ID, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if err := incTplTimes(data.Type, data.Ledger); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
