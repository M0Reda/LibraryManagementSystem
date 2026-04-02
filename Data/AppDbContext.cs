using LibraryManagementSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Author> Authors { get; set; } = null!;
        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<Member> Members { get; set; } = null!;
        public DbSet<MemberProfile> MemberProfiles { get; set; } = null!;
        public DbSet<Borrowing> Borrowings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Member>()
                .HasOne(m => m.Profile)
                .WithOne(p => p.Member)
                .HasForeignKey<MemberProfile>(p => p.MemberId);

            modelBuilder.Entity<Author>()
                .HasMany(a => a.Books)
                .WithOne(b => b.Author)
                .HasForeignKey(b => b.AuthorId);

            modelBuilder.Entity<Borrowing>()
                .HasOne(b => b.Member)
                .WithMany(m => m.Borrowings)
                .HasForeignKey(b => b.MemberId);

            modelBuilder.Entity<Borrowing>()
                .HasOne(b => b.Book)
                .WithMany(bk => bk.Borrowings)
                .HasForeignKey(b => b.BookId);

            modelBuilder.Entity<Member>()
                .HasIndex(m => m.Email)
                .IsUnique();

            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN)
                .IsUnique();

            modelBuilder.Entity<MemberProfile>()
                .HasIndex(p => p.MemberId)
                .IsUnique();

            string adminPassHash = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgJRv/dY7E6dFvG2J9uYdREzP4fS";

            modelBuilder.Entity<Author>().HasData(
                new Author { Id = 1, Name = "J.K. Rowling", Email = "rowling@author.com", Bio = "Author of Harry Potter" },
                new Author { Id = 2, Name = "George R.R. Martin", Email = "martin@author.com", Bio = "Author of ASOIAF" },
                new Author { Id = 3, Name = "Stephen King", Email = "king@author.com", Bio = "King of Horror" }
            );

            modelBuilder.Entity<Book>().HasData(
                new Book { Id = 1, Title = "Harry Potter 1", ISBN = "HP001", PublishedYear = 1997, AuthorId = 1 },
                new Book { Id = 2, Title = "The Way of Kings", ISBN = "TWK001", PublishedYear = 2010, AuthorId = 1 },
                new Book { Id = 3, Title = "A Game of Thrones", ISBN = "GOT001", PublishedYear = 1996, AuthorId = 2 },
                new Book { Id = 4, Title = "The Shining", ISBN = "SHIN001", PublishedYear = 1977, AuthorId = 3 },
                new Book { Id = 5, Title = "It", ISBN = "IT001", PublishedYear = 1986, AuthorId = 3 }
            );

            modelBuilder.Entity<Member>().HasData(
                new Member { Id = 1, FullName = "Admin User", Email = "admin@library.com", PasswordHash = adminPassHash, Role = "Admin" },
                new Member { Id = 2, FullName = "John Doe", Email = "john@member.com", PasswordHash = adminPassHash, Role = "Member" },
                new Member { Id = 3, FullName = "Jane Doe", Email = "jane@member.com", PasswordHash = adminPassHash, Role = "Member" }
            );

            modelBuilder.Entity<MemberProfile>().HasData(
                new MemberProfile { Id = 1, Phone = "123456789", Address = "Admin HQ", Bio = "Systems Admin", MemberId = 1 },
                new MemberProfile { Id = 2, Phone = "987654321", Address = "John's Street", Bio = "Avid Reader", MemberId = 2 },
                new MemberProfile { Id = 3, Phone = "456789123", Address = "Jane's Street", Bio = "Student", MemberId = 3 }
            );
        }
    }
}
