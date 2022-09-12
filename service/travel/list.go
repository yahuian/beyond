package travel

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type listParam struct {
	ID        []uint   `form:"id[]" json:"id"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
}

// @Summary 足迹
// @Tags    旅行足迹
// @Accept  json
// @Produce json
// @Param   page         query    int    false "page"
// @Param   size         query    int    false "size"
// @Param   id[]         query    uint   false "id"
// @Param   created_at[] query    string false "created_at"
// @Success 200          {object} ctx.Response{data=[]db.Travel}
// @Router  /travel [get]
func List(c *ctx.Context) {
	paging, err := c.Paging()
	if err != nil {
		c.BadRequest(err)
		return
	}
	query, args, err := c.BuildQuery(&listParam{})
	if err != nil {
		c.BadRequest(err)
		return
	}

	count, err := db.Count[db.Travel](query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if count == 0 {
		c.SuccessWith(ctx.Response{Msg: "success", Count: 0})
		return
	}

	opt := db.Option{
		Page:  paging.Page,
		Size:  paging.Size,
		Query: query,
		Args:  args,
		Order: "created_at desc",
	}

	list, err := db.NewTravelDao().GetMany(opt)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: list, Count: count})
}

type allListResp struct {
	Name string `json:"name"`
}

// @Summary 所有标记过的城市
// @Tags    旅行足迹
// @Accept  json
// @Produce json
// @Success 200 {object} ctx.Response{data=[]allListResp}
// @Router  /travel/all [get]
func AllList(c *ctx.Context) {
	count, err := db.Count[db.Travel]("")
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	list, err := db.GetAll[db.Travel]("")
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	resp := make([]allListResp, 0, len(list))
	for _, v := range list {
		resp = append(resp, allListResp{
			Name: v.Name,
		})
	}

	// BUG 不睡眠会触发 https://github.com/ant-design/ant-design-charts/issues/1522
	// 具体原因未知
	time.Sleep(2 * time.Second)

	c.SuccessWith(ctx.Response{Msg: "success", Data: resp, Count: count})
}
