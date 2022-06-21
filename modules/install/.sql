--PostgreSQL
create table if not exists m_clients(
    id serial primary key,
    sname  varchar(100) not null,
    name varchar(100) not null,
    pname varchar(100),
    email varchar(100) not null,
    mobile numeric(10) not null,
    birth date not null
);

create table if not exists m_item_categories(
    id serial primary key,
    name varchar(50) not null
);

create table if not exists m_item_names(
    id serial primary key,
    id_cat int not null,
    name varchar(100) not null,
    cost money not null,
    count int default 0,
    defen jsonb null,
    foreign key(id_cat) references m_item_categories(id)
);

create table if not exists m_item_move(
    id serial primary key,
    id_item int not null,
    offs int not null,
    foreign key(id_item) references m_item_names(id)
);

create table if not exists m_order(
    id serial primary key,
    id_client int not null,
    order_date date not null,
    delivery_date date null,
    canceled boolean default false,
    foreign key(id_client) references m_clients(id)
);

create table if not exists m_order_details(
    id_order int not null,
    id_item int not null,
    count int,
    foreign key(id_item) references m_item_names(id),
    foreign key(id_order) references m_order(id),
    primary key (id_order, id_item)
);

create table if not exists m_paybill(
    id serial primary key,
    id_order int not null,
    date_bill date not null,
    sum money,
    foreign key(id_order) references m_order(id)
);

create table if not exists m_basket(
    id_client int not null,
    id_item int not null,
    count int,
    foreign key(id_item) references m_item_names(id),
    foreign key(id_client) references m_clients(id),
    primary key (id_client, id_item)
)