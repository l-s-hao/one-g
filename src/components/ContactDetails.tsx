import { siteContact } from "@/data/site-contact";

export default function ContactDetails({ actions = false }: { actions?: boolean }) {
  return <div className="space-y-3 text-sm">
    <p>客服电话：{siteContact.phone}</p>
    <p>客服邮箱：{siteContact.email}</p>
    <p>当前为演示联系信息，正式联系方式待确认。</p>
    {actions && <div className="flex flex-wrap gap-5" aria-label="联系 ONE-G">
      <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={`tel:${siteContact.phone.replace(/\s/g, "")}`}>拨打电话</a>
      <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={`mailto:${siteContact.email}`}>发送邮件</a>
    </div>}
  </div>;
}
