-- Create Device table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Device' and xtype='U')
CREATE TABLE Device (
    sku NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(255),
    description NVARCHAR(MAX),
    image NVARCHAR(MAX)
);

-- Create Order table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Order' and xtype='U')
CREATE TABLE [Order] (
    orderID INT PRIMARY KEY IDENTITY(1,1),
    sku NVARCHAR(50),
    price DECIMAL(10, 2),
    userID NVARCHAR(50),
    status NVARCHAR(50),
    FOREIGN KEY (sku) REFERENCES Device(sku)
);

-- Create Basket table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Basket' and xtype='U')
CREATE TABLE Basket (
    basketID INT PRIMARY KEY IDENTITY(1,1),
    sku NVARCHAR(50),
    price DECIMAL(10, 2),
    userID NVARCHAR(50),
    FOREIGN KEY (sku) REFERENCES Device(sku)
);

-- Create Warranty table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Warranty' and xtype='U')
CREATE TABLE Warranty (
    warrantyID INT PRIMARY KEY IDENTITY(1,1),
    orderID INT,
    status NVARCHAR(50),
    item1 NVARCHAR(MAX),
    item2 NVARCHAR(MAX),
    item3 NVARCHAR(MAX),
    FOREIGN KEY (orderID) REFERENCES [Order](orderID)
);
