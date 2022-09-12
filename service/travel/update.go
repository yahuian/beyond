package travel

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type updateParam struct {
	ID uint64 `json:"id" validate:"required"`
	createParam
	Files []uint64 `json:"files"` // files ids
}

// @Summary 更新标记
// @Tags    旅行足迹
// @Accept  json
// @Produce json
// @param   payload body     updateParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.Travel}
// @Router  /travel [put]
func Update(c *ctx.Context) {
	var param updateParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	count, err := db.Count[db.Travel]("id = ?", param.ID)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if count == 0 {
		c.BadRequest(errorx.New("id not found"))
		return
	}

	// get files
	files, err := db.GetAll[db.File]("id IN ?", param.Files)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	area, err := getArea(c, param.Name, "city")
	if err != nil {
		return
	}

	data := &db.Travel{
		ID:        param.ID,
		Name:      param.Name,
		Level:     area.Level,
		Note:      param.Note,
		CreatedAt: param.CreatedAt,
		Files:     files,
	}

	if err := db.UpdateAllByID(data.ID, data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
