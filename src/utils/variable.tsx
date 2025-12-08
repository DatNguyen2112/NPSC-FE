export const keyUser = 'm8nvn*&hKwcgb^D-D#Hz^5CXfKySpY';
export const keyToken = 'b7a2bdf4-ac40-4012-9635-ff4b7e55eae0';
export const keyRefreshToken = '15c665b7-592f-4b60-b31f-a252579a3bd0';
export const timeBuild = '0fc57d7b-0b51-41ef-8b7e-ed7b7d5dba16';
export const notificationChannel = 'f0f33934-1272-4d31-928f-71226e35ccd8';
export const linkApi = import.meta.env.VITE_URL_API;
export const linkFile = new URL('/files', linkApi).toString();
export const linkWebUrl = import.meta.env.VITE_WEB_URL;
export const languages = import.meta.env.VITE_URL_LANGUAGES?.split(',');
export const language = import.meta.env.VITE_URL_LANGUAGE;
export const localApi = import.meta.env.VITE_URL_LOCAL;
// export const urlChat = import.meta.env.REACT_APP_URL_CHAT;
// export const passChat = 'RL?N*&M%8+G=Q3$FgLbQdD7A4d3PNj';
// export const firebaseConfig = {
//   apiKey: import.meta.env.REACT_APP_API_KEY_FIREBASE,
//   authDomain: import.meta.env.REACT_APP_AUTH_DOMAIN_FIREBASE,
//   projectId: import.meta.env.REACT_APP_PROJECT_ID_FIREBASE,
//   storageBucket: import.meta.env.REACT_APP_STORAGE_BUCKET_FIREBASE,
//   messagingSenderId: import.meta.env.REACT_APP_MESSAGING_SENDER_ID_FIREBASE,
//   appId: import.meta.env.REACT_APP_APP_ID_FIREBASE
// };
export const listType = [
  { value: 'type1', label: 'Type 1' },
  { value: 'type2', label: 'Type 2' },
  { value: 'type3', label: 'Type 3' },
];
export enum keyRole {
  P_AUTH_DELETE_IMAGE_TEMP = '11cc566b-b109-49f8-983f-84ff08f9849e',

  P_CODE_TYPE_LISTED = '2a71d57d-7c2d-49ad-a7e9-3cd4aace132f',
  P_CODE_TYPE_DETAIL = '7af26c77-e81f-4875-89df-9d4c2fa3ce52',
  P_CODE_TYPE_CREATE = '45f014c0-9ebe-497e-9766-2054ebb7e1d5',
  P_CODE_TYPE_UPDATE = 'fdb47b79-1a6e-49be-8f5b-8525a547534a',
  P_CODE_TYPE_DELETE = 'f16e2bc7-12b9-446e-b53b-a2597ca0ad3a',

  P_CODE_LISTED = '5d808d76-bf99-4a51-b4b6-d5aa37bdb398',
  P_CODE_DETAIL = 'eb510a79-4f75-4b14-a118-f036c1daa430',
  P_CODE_CREATE = 'a9574d5e-269d-44f9-a5bb-41cf06d7bdda',
  P_CODE_UPDATE = '6d34b679-9c0e-489a-a2de-a17e37fadf72',
  P_CODE_DELETE = 'e21ac25b-1651-443e-9834-e593789807c9',

  P_USER_ROLE_LISTED = '8f559613-ef55-4ef0-8068-8c37e84b75de',
  P_USER_ROLE_DETAIL = '35ea86b5-e591-4819-9c41-4d35ed580d0b',
  P_USER_ROLE_CREATE = 'f6732943-cb1d-484b-8644-7740a295e3e3',
  P_USER_ROLE_UPDATE = '3e8aa2c2-35bf-4a56-8bf2-8f8de240e24c',
  P_USER_ROLE_DELETE = '62fd3bc2-0921-4113-9b5b-9966dd5a0517',

  P_USER_LISTED = 'ac0c4f13-776d-4b71-be4d-f9952734a319',
  P_USER_DETAIL = 'a9de3f3d-4c04-4f50-9d1b-c3c2e2eca6dc',
  P_USER_CREATE = '41c9d4e1-ba5a-4850-ad52-35ac928a61d9',
  P_USER_UPDATE = 'bc0b5f32-ddf7-4c61-b435-384fc5ac7574',
  P_USER_DELETE = 'b82e6224-12c3-4e6c-b4e0-62495fb799bf',

  P_DATA_TYPE_LISTED = '2712ca04-7e7c-44b6-83c1-b8c7f332a0fb',
  P_DATA_TYPE_CREATE = '03380c3a-3336-42f4-b8c2-e54084d35655',
  P_DATA_TYPE_UPDATE = '00e77095-35ea-4755-bbae-46a1ba78e46e',
  P_DATA_TYPE_DELETE = '0e481286-bd5d-4203-a374-a8f8f8735f33',

  P_DATA_LISTED = '1db70aa0-7541-4433-b2f6-fbd7bf8bf7bb',
  P_DATA_CREATE = 'c3ab9e11-7ba3-4afd-b5cb-c560362a3144',
  P_DATA_UPDATE = '99ea12da-5800-4d6d-9e73-60c016a267a9',
  P_DATA_DELETE = '2e8c8772-2505-4683-b6fa-13fa2570eee7',

  P_PARAMETER_LISTED = 'd278abcb-1956-4b45-95c1-2ab612110ec6',
  P_PARAMETER_CREATE = 'd9185449-e2ac-4e72-9c9f-25788c23d5ba',
  P_PARAMETER_UPDATE = '3d478437-949b-4ae7-9c21-79cabb1663a3',
  P_PARAMETER_DELETE = '275ebda7-3e03-4c93-b352-baa7705528aa',

  P_POST_LISTED = '7c34dc92-cbbe-4419-8dbc-745818d76098',
  P_POST_CREATE = '0ca9634c-3496-4059-bf86-5bec23c96b55',
  P_POST_UPDATE = 'eda2799a-4072-46a7-9a26-efa9a98036db',
  P_POST_DELETE = '4097d5ff-e35c-4bff-a5b1-013ca1181762',

  P_POST_TYPE_LISTED = 'efa34c52-8c9a-444d-a82b-8bec109dbab5',
  P_POST_TYPE_CREATE = '87cb77c4-565c-43ec-bffc-fbaf5077c2be',
  P_POST_TYPE_UPDATE = 'bfa36cef-71c4-4f08-89e6-d7e0c1c03ba4',
  P_POST_TYPE_DELETE = 'cd00c62e-1ec4-4c61-b273-cdd6867a3212',
}

export const uploadConstants = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// truncate
export const truncate = (str: string, n: number) => {
  return str?.length > n ? str.substring(0, n - 1) + '...' : str;
};

export const rightMapCodeConstruction = 'CONSTRUCTION';

export const dateFormat = 'DD/MM/YYYY';

// List Account Banking
export const listAccountBanking = [
  {
    bank_id: '201',
    bank_code: 'ICB',
    bank_name: 'NH TMCP Công Thương Việt Nam',
    bank_name_en: 'Vietinbank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/CTG.png',
    is_active: false,
  },
  {
    bank_id: '202',
    bank_code: 'BIDV',
    bank_name: 'NH TMCP Đầu Tư và Phát Triển Việt Nam',
    bank_name_en: 'BIDV',
    bank_logo:
      'https://d3hr4eej8cfgwy.cloudfront.net/finan-prd/1d78990d-33ef-4278-94a9-881c7c57d4ae/image/1fea216f-0b4d-46c4-b74a-8044685f38c0.png',
    is_active: true,
  },
  {
    bank_id: '203',
    bank_code: 'VCB',
    bank_name: 'NH TMCP Ngoại Thương',
    bank_name_en: 'Vietcombank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VCB.png',
    is_active: false,
  },
  {
    bank_id: '204',
    bank_code: 'VBA',
    bank_name: 'NH Nhà Nước va Phát Triển Nông Thôn',
    bank_name_en: 'Agribank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VARB.png',
    is_active: false,
  },
  {
    bank_id: '302',
    bank_code: 'MSB',
    bank_name: 'NH TMCP Hàng Hải',
    bank_name_en: 'MaritimeBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/MSB.png',
    is_active: true,
  },
  {
    bank_id: '303',
    bank_code: 'STB',
    bank_name: 'NH TMCP Sài Gòn Thưong Tín',
    bank_name_en: 'Sacombank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/STB.png',
    is_active: false,
  },
  {
    bank_id: '304',
    bank_code: 'DOB',
    bank_name: 'NH TMCP Đông Á',
    bank_name_en: 'DongABank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/DAB.png',
    is_active: false,
  },
  {
    bank_id: '305',
    bank_code: 'EIB',
    bank_name: 'NH TMCP Xuất Nhập Khẩu',
    bank_name_en: 'Eximbank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/EIB.png',
    is_active: false,
  },
  {
    bank_id: '306',
    bank_code: 'NAB',
    bank_name: 'NH TMCP Nam Á',
    bank_name_en: 'NamABank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/NAB.png',
    is_active: false,
  },
  {
    bank_id: '307',
    bank_code: 'ACB',
    bank_name: 'NH TMCP Á Châu',
    bank_name_en: 'ACB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/ACB.png',
    is_active: false,
  },
  {
    bank_id: '308',
    bank_code: 'SGICB',
    bank_name: 'NH TMCP Sài Gòn Công Thương',
    bank_name_en: 'Saigonbank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/SGB.png',
    is_active: false,
  },
  {
    bank_id: '309',
    bank_code: 'VPB',
    bank_name: 'NH TMCP Việt Nam Thịnh Vượng',
    bank_name_en: 'VPBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VPB.png',
    is_active: false,
  },
  {
    bank_id: '310',
    bank_code: 'TCB',
    bank_name: 'NH TMCP Kỹ Thương Việt Nam',
    bank_name_en: 'Techcombank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/TCB.png',
    is_active: false,
  },
  {
    bank_id: '311',
    bank_code: 'MB',
    bank_name: 'NH TMCP Quân Đội ',
    bank_name_en: 'MBBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/MB.png',
    is_active: true,
  },
  {
    bank_id: '313',
    bank_code: 'BAB',
    bank_name: 'NH TMCP Bắc Á',
    bank_name_en: 'BacABank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/NASB.png',
    is_active: false,
  },
  {
    bank_id: '314',
    bank_code: 'VIB',
    bank_name: 'NH TMCP Quốc Tế',
    bank_name_en: 'VIB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VIB.png',
    is_active: false,
  },
  {
    bank_id: '317',
    bank_code: 'SEAB',
    bank_name: 'NH TMCP Đông Nam Á',
    bank_name_en: 'SeABank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/Seab.png',
    is_active: false,
  },
  {
    bank_id: '319',
    bank_code: 'Oceanbank',
    bank_name: 'NH TM TNHH MTV Đại Dương',
    bank_name_en: 'OceanBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/OJB.png',
    is_active: false,
  },
  {
    bank_id: '320',
    bank_code: 'GPB',
    bank_name: 'NH TM TNHH MTV Dầu Khí Toàn Cầu',
    bank_name_en: 'GPBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/GPB.png',
    is_active: false,
  },
  {
    bank_id: '321',
    bank_code: 'HDB',
    bank_name: 'NH TMCP Phát Triển TP HCM',
    bank_name_en: 'HDBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/HDB.png',
    is_active: false,
  },
  {
    bank_id: '323',
    bank_code: 'ABB',
    bank_name: 'NH TMCP An Bình',
    bank_name_en: 'ABBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/ABB.png',
    is_active: false,
  },
  {
    bank_id: '327',
    bank_code: 'VCCB',
    bank_name: 'NH TMCP Bản Việt',
    bank_name_en: 'BVBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VCCB.png',
    is_active: false,
  },
  {
    bank_id: '333',
    bank_code: 'OCB',
    bank_name: 'NH TMCP Phương Đông',
    bank_name_en: 'OCB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/OCB.png',
    is_active: false,
  },
  {
    bank_id: '334',
    bank_code: 'SCB',
    bank_name: 'NH TMCP Sài Gòn',
    bank_name_en: 'SCB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/SCB.png',
    is_active: false,
  },
  {
    bank_id: '339',
    bank_code: 'CBB',
    bank_name: 'NH TM TNHH MTV Xây Dựng Việt Nam',
    bank_name_en: 'CBBank',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_cbbank.png',
    is_active: false,
  },
  {
    bank_id: '341',
    bank_code: 'PGB',
    bank_name: 'NH TMCP Xăng Dầu Petrolimex',
    bank_name_en: 'PGBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/PGB.png',
    is_active: false,
  },
  {
    bank_id: '348',
    bank_code: 'SHB',
    bank_name: 'NH TMCP Sài Gòn Hà Nội',
    bank_name_en: 'SHB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/SHB.png',
    is_active: false,
  },
  {
    bank_id: '352',
    bank_code: 'NCB',
    bank_name: 'NH TMCP Quốc Dân',
    bank_name_en: 'National Citizen Bank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/NVB.png',
    is_active: false,
  },
  {
    bank_id: '353',
    bank_code: 'KLB',
    bank_name: 'NH TMCP Kien Long',
    bank_name_en: 'KienlongBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/KLB.png',
    is_active: false,
  },
  {
    bank_id: '355',
    bank_code: 'VAB',
    bank_name: 'NH TMCP Việt Á',
    bank_name_en: 'VietABank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VAB.png',
    is_active: false,
  },
  {
    bank_id: '356',
    bank_code: 'VIETBANK',
    bank_name: 'NH TMCP Việt Nam Thương Tín',
    bank_name_en: 'VietBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/VB.png',
    is_active: false,
  },
  {
    bank_id: '357',
    bank_code: 'LPB',
    bank_name: 'NH TMCP Bưu Điện Liên Việt',
    bank_name_en: 'LienVietPostBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/LPB.png',
    is_active: false,
  },
  {
    bank_id: '358',
    bank_code: 'TPB',
    bank_name: 'NH TMCP Tiền Phong',
    bank_name_en: 'TPBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/TPB.png',
    is_active: false,
  },
  {
    bank_id: '359',
    bank_code: 'BVB',
    bank_name: 'NH TMCP Bảo Việt',
    bank_name_en: 'BaoVietBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/BVB.png',
    is_active: false,
  },
  {
    bank_id: '360',
    bank_code: 'PVCB',
    bank_name: 'NH TMCP Đại Chúng',
    bank_name_en: 'PVcomBank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/PVCB.png',
    is_active: false,
  },
  {
    bank_id: '501',
    bank_code: 'PBVN',
    bank_name: 'NH TNHH MTV Public Viet Nam',
    bank_name_en: 'Public Bank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/PBVN.png',
    is_active: false,
  },
  {
    bank_id: '502',
    bank_code: 'IVB',
    bank_name: 'NH TNHH Indovina',
    bank_name_en: 'Indovina Bank',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/IVB.png',
    is_active: false,
  },
  {
    bank_id: '505',
    bank_code: 'VRB',
    bank_name: 'NH Liên Doanh Việt Nga',
    bank_name_en: 'VRB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/sdk/VRB.png',
    is_active: false,
  },
  {
    bank_id: '603',
    bank_code: 'HLBVN',
    bank_name: 'NH MTV Hong Leong',
    bank_name_en: 'Hong Leong',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_hong_leon_bank.png',
    is_active: false,
  },
  {
    bank_id: '604',
    bank_code: 'SCVN',
    bank_name: 'NH TNHH Standard Chartered',
    bank_name_en: 'Standard Chartered',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_standard_chartered.png',
    is_active: false,
  },
  {
    bank_id: '605',
    bank_code: 'CITIBANK',
    bank_name: 'NH Citibank',
    bank_name_en: 'Citibank',
    bank_logo: 'https://api.vietqr.io/img/CITIBANK.png',
    is_active: false,
  },
  {
    bank_id: '616',
    bank_code: 'SHBVN',
    bank_name: 'NH TNHH MTV Shinhan Viet Nam',
    bank_name_en: 'Shinhan',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/SVB.png',
    is_active: true,
  },
  {
    bank_id: '617',
    bank_code: 'HSBC',
    bank_name: 'NH TNHH MTV HSBC Viet Nam',
    bank_name_en: 'HSBC',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_hsbc.png',
    is_active: false,
  },
  {
    bank_id: '626',
    bank_code: 'KEBHANAHN',
    bank_name: 'NH KEB Hana HN',
    bank_name_en: 'KEB Hana HN',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/sdk/KebHana.png',
    is_active: false,
  },
  {
    bank_id: '631',
    bank_code: 'KBHCM',
    bank_name: 'NH Kookmin Tp HCM',
    bank_name_en: 'Kookmin HCM',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kookmin_hcm.png',
    is_active: false,
  },
  {
    bank_id: '641',
    bank_code: 'IBK - HCM',
    bank_name: 'NH Công Nghiệp Hàn Quốc Tp HCM',
    bank_name_en: 'Industrial Bank of Korea HCM',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_ibk_bank.png',
    is_active: false,
  },
  {
    bank_id: '650',
    bank_code: 'DBS',
    bank_name: 'NH DBS Bank Ltd',
    bank_name_en: 'DBS Bank Ltd ',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_dbs.png',
    is_active: false,
  },
  {
    bank_id: '652',
    bank_code: 'IBK - HN',
    bank_name: 'NH Công Nghiệp Hàn Quốc HN',
    bank_name_en: 'Industrial Bank of Korea HN',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_ibk_bank.png',
    is_active: false,
  },
  {
    bank_id: '656',
    bank_code: 'KEBHANAHCM',
    bank_name: 'NH KEB Hana HCM',
    bank_name_en: 'KEB Hana HCM',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/sdk/KebHana.png',
    is_active: false,
  },
  {
    bank_id: '661',
    bank_code: 'CIMB',
    bank_name: 'NH TNHH MTV CIMB Viet Nam',
    bank_name_en: 'CIMB Viet Nam',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_cimb.png',
    is_active: false,
  },
  {
    bank_id: '662',
    bank_code: '',
    bank_name: 'NH Nong Hyup',
    bank_name_en: 'Nong Hyup',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_nonghyu.png',
    is_active: false,
  },
  {
    bank_id: '663',
    bank_code: 'WVN',
    bank_name: 'NH TNHH MTV WOORI Viet Nam',
    bank_name_en: 'WOORI',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/WOO.png',
    is_active: false,
  },
  {
    bank_id: '665',
    bank_code: 'UOB',
    bank_name: 'NH TNHH MTV United Overseas Bank VN',
    bank_name_en: 'UOB',
    bank_logo: 'https://img.mservice.com.vn/momo_app_v2/img/UOB.png',
    is_active: false,
  },
  {
    bank_id: '666',
    bank_code: 'KBHN',
    bank_name: 'NH Kookmin HN',
    bank_name_en: 'Kookmin HN',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kookmin_hn.png',
    is_active: false,
  },
  {
    bank_id: '669',
    bank_code: 'KBank',
    bank_name: 'NH TNHH Đại Chúng Kasikornbank',
    bank_name_en: 'Kasikornbank',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kbank.png',
    is_active: false,
  },
  {
    bank_id: '901',
    bank_code: 'COOPBANK',
    bank_name: 'NH Hợp Tác Xã Việt Nam',
    bank_name_en: 'CoopBank',
    bank_logo: 'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_coop_bank.png',
    is_active: false,
  },
];

export const getRandomHexColor = (): string => {
  return (
    '#' +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')
  );
};
