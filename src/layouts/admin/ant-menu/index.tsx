import { GlobalFacade, Navigation, NavigationFacade } from '@store';
import { lang, renderTitleBreadcrumbs } from '@utils';
import { Menu, TreeNodeProps } from 'antd';
import { MenuItemType } from 'antd/lib/menu/interface';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

const AntMenu = () => {
  const navigationFacade = NavigationFacade();
  const navigate = useNavigate();
  const globalFacade = GlobalFacade();
  const onChange = (key: string) => {
    const linkActive = `/${lang}${key}`;
    navigate(linkActive);
  };

  navigationFacade?.menu?.forEach((item: any) => {
    if (item?.children?.length === 0 && location.hash.includes(lang + item?.urlRewrite))
      renderTitleBreadcrumbs(item.name);
    else if (item?.children?.some((subItem: any) => location.hash.includes(lang + subItem?.urlRewrite)))
      renderTitleBreadcrumbs(item.name);
  });

  useEffect(() => {
    navigationFacade.getMenu({ isAdmin: 1, isGetRoles: true });
  }, []);

  useEffect(() => {}, [location]);

  const menuItems: MenuItemType[] =
    navigationFacade.menu?.map((items) => ({
      icon: <i className={`${items.iconClass} !text-xl`} />,
      label: items.name,
      key: items.urlRewrite,
      value: items.name,
      children:
        items.subChild.length !== 0
          ? items.subChild.map((item: Navigation) => ({
              label: item.name,
              key: item.urlRewrite,
              icon: <i className={`${item.iconClass} !text-xl`} />,
            }))
          : undefined,
    })) ?? [];

  const defaultSubMenu: Navigation = navigationFacade.menu
    ?.flatMap((itemFlatMap) => {
      if (itemFlatMap.subChild.length > 0) return [itemFlatMap, ...itemFlatMap.subChild];
      return itemFlatMap;
    })
    .find((itemFilter) => location.hash.startsWith(`#/${lang}${itemFilter.urlRewrite}`));

  const defaultMenu: TreeNodeProps[] =
    navigationFacade.menu?.filter((items) => items.id === defaultSubMenu?.parentId) ?? [];

  return (
    <>
      {defaultSubMenu?.urlRewrite && defaultSubMenu.urlRewrite.length > 0 ? (
        <Menu
          theme={globalFacade.siderColor === '!bg-[#002140]' ? 'dark' : undefined}
          key={`9b2fe5aa-007f-478a-8f61-933e4056c356`}
          defaultOpenKeys={[defaultMenu[0]?.urlRewrite]}
          defaultSelectedKeys={[defaultSubMenu?.urlRewrite]}
          forceSubMenuRender
          // className={`text-md font-medium h-[calc(100vh-7rem)] overflow-auto miniScroll ${globalFacade.siderColor}`}
          className={`h-[calc(100vh-7rem)] font-medium overflow-auto miniScroll ${globalFacade.siderColor}`}
          items={menuItems}
          mode={'inline'}
          onClick={({ key }) => onChange(key)}
          selectedKeys={[defaultSubMenu?.urlRewrite]}
        />
      ) : (
        <Menu
          theme={globalFacade.siderColor === '!bg-[#002140]' ? 'dark' : undefined}
          key={`3414ce98-4cde-40c5-a54b-3dc81bdf3938`}
          defaultOpenKeys={[defaultMenu[0]?.urlRewrite]}
          defaultSelectedKeys={[defaultSubMenu?.urlRewrite]}
          forceSubMenuRender
          // className={`text-md font-medium h-[calc(100vh-7rem)] overflow-auto miniScroll ${globalFacade.siderColor}`}
          className={`h-[calc(100vh-7rem)] font-medium overflow-auto miniScroll ${globalFacade.siderColor}`}
          items={menuItems}
          mode={'inline'}
          onClick={({ key }) => onChange(key)}
          selectedKeys={[defaultSubMenu?.urlRewrite]}
        />
      )}
    </>
  );
};
export default AntMenu;
