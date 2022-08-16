package details

import (
	"fmt"
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Name      string    `json:"name" validate:"max=20"`
	Money     float64   `json:"money" validate:"required"`
	Kind      string    `json:"kind" validate:"oneof=income pay"`
	Type      string    `json:"type" validate:"max=20"`
	Ledger    string    `json:"ledger" validate:"max=20"`
	Note      string    `json:"note" validate:"max=200"`
	CreatedAt time.Time `json:"created_at"`
}

// @Summary 增加明细
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillDetails}
// @Router  /bill/details [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	if err := checkTpl(c, param.Type, param.Ledger); err != nil {
		return
	}

	data := &db.BillDetails{
		Name:      param.Name,
		Money:     param.Money,
		Kind:      param.Kind,
		Type:      param.Type,
		Ledger:    param.Ledger,
		Note:      param.Note,
		CreatedAt: param.CreatedAt,
	}

	if err := db.Create(data); err != nil {
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

func checkTpl(c *ctx.Context, Type, ledger string) error {
	for _, v := range []string{Type, ledger} {
		if v == "" {
			continue
		}

		count, err := db.Count[db.BillTemplate]("name = ?", v)
		if err != nil {
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return err
		}

		if count == 0 {
			err := fmt.Errorf("%s not found", v)
			c.BadRequest(err)
			return err
		}
	}
	return nil
}

func incTplTimes(Type, ledger string) error {
	for _, v := range []string{Type, ledger} {
		if v == "" {
			continue
		}

		data, err := db.GetOne[db.BillTemplate]("name = ?", v)
		if err != nil {
			return errorx.Wrap(err)
		}
		data.Times++

		if err := db.UpdateByID(data.ID, &data); err != nil {
			return errorx.Wrap(err)
		}
	}
	return nil
}
