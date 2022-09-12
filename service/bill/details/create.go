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
	Money     float64   `json:"money" validate:"required"`
	Kind      string    `json:"kind" validate:"oneof=income pay"`
	Type      string    `json:"type" validate:"max=20"`
	Ledger    string    `json:"ledger" validate:"max=20"`
	Note      string    `json:"note" validate:"max=200"`
	CreatedAt time.Time `json:"created_at"`
}

// @Summary 增加明细
// @Tags    每日记账
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

func checkTpl(c *ctx.Context, typeName, ledger string) error {
	if typeName != "" {
		{
			count, err := db.Count[db.BillType]("name = ?", typeName)
			if err != nil {
				logx.Errorf("%+v", err)
				c.InternalErr(err)
				return err
			}

			if count == 0 {
				err := fmt.Errorf("%s not found", typeName)
				c.BadRequest(err)
				return err
			}
		}
	}

	if ledger != "" {
		{
			count, err := db.Count[db.BillLedger]("name = ?", ledger)
			if err != nil {
				logx.Errorf("%+v", err)
				c.InternalErr(err)
				return err
			}

			if count == 0 {
				err := fmt.Errorf("%s not found", ledger)
				c.BadRequest(err)
				return err
			}
		}
	}

	return nil
}

func incTplTimes(typeName, ledger string) error {
	if typeName != "" {
		{
			data, err := db.GetOne[db.BillType]("name = ?", typeName)
			if err != nil {
				return errorx.Wrap(err)
			}

			if err := db.UpdateByID(data.ID, &db.BillType{Times: data.Times + 1}); err != nil {
				return errorx.Wrap(err)
			}
		}
	}

	if ledger != "" {
		{
			data, err := db.GetOne[db.BillLedger]("name = ?", ledger)
			if err != nil {
				return errorx.Wrap(err)
			}

			if err := db.UpdateByID(data.ID, &db.BillLedger{Times: data.Times + 1}); err != nil {
				return errorx.Wrap(err)
			}
		}
	}

	return nil
}
